import React from 'react';
import './App.css'
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import firebase from './Firebase.js';
import { getLatLng, geocodeByAddress } from 'react-google-places-autocomplete/dist/utils/googleGeocodesHelper';
import 'bootstrap/dist/css/bootstrap.min.css';
import GoogleMapReact from 'google-map-react';



let db = firebase.firestore()
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      City: '',
      Id: '',
      coordinate: null,
      center: {
        lat: 59.95,
        lng: 30.33
      },
      zoom: 11
    }
  }

  //Запись в базу данных
  submit = (event) => {
    event.preventDefault();
    if (this.state.City != '') {
      db.collection('locations').add({
        Name: this.state.City,
        id: this.state.Id,
        coordinate: this.state.coordinate
      }).then(window.alert('Город был успешно добавлен'))
    } else {
      return (window.alert('Строка поиска не должна быть пустой'))
    }
  }

  //удаление из Базы данных
  delete = (props) => {
    let alert = window.confirm('Удаление необратимо. Вы уверены?')
    if (alert) {
      db.collection('locations').doc(props).delete().then(() => {
        window.alert('Вы удалили запись')
        console.log('Удалено')
      }).catch(err => {
        console.log(err)
      })
    }
    else {
      window.alert('Вы отменили удаление')
    }
  }

  //отключить уведомление
  disableAlert = () => {
    console.log('disable start')
    this.setState({
      display: 'hidden'
    })
  }

  //достать данные по длине и широте
  getData = () => {
    geocodeByAddress(this.state.City).then(results => getLatLng(results[0]))
      .then((res) => {
        let coord = res.lat + ',' + res.lng;
        console.log(coord)
        this.setState({ coordinate: coord })
      });
  }

  //отобразить список городов из базы. Обновляется благодаря онснапшот
  get = () => {
    db.collection('locations').onSnapshot(({ docs }) => {
      this.setState({ items: docs.map(doc => ({ ...doc.data(), id: doc.id })) })
    })
    console.log(this.state.items)
  }

  
  // отобразить город на карте по координатам
  onClickAnchor = (coordinate) => {
    const lat = parseFloat(coordinate.split(',')[0])
    const lng = parseFloat(coordinate.split(',')[1])
    
    this.setState({ center: { lat, lng}})
  }

  render() {

    return (

      <div className="App">

        <GooglePlacesAutocomplete
          inputStyle={{
            width: '50vw', outline: 'none', height: '3vw', color: 'black',
            font: '400 2.08vw Montserrat',
            margin: '5vw auto 0 auto', display: 'block', padding: '10px', borderRadius: '10px', border: '1px solid grey'
          }}
          
          placeholder='Введите название города...'
          onSelect={({ id, description }) => {
            console.log(id)
            this.setState({
              Id: id,
              City: description
            }, this.getData) // передать вторым аргументом для обновления координат корректно

          }

          }
          renderSuggestions={(active, suggestions, onSelectSuggestion) => (
            <div className='suggestions-container'>
              {suggestions.map((suggestion) => (
                <div
                  className="suggestion"
                  onClick={(event) => onSelectSuggestion(suggestion, event)}
                >
                  {suggestion.description}
                </div>
              ))}
            </div>
          )}

        />
        

        <button style={{
          width: '12vw',
          display: 'block',
          outline: 'none',
          margin: '1vw auto 1vw auto',
          cursor: 'pointer',
          height: '3vw',
          border: 'none',
          borderRadius: '10px',
          font: '400 1.5vw Montserrat'
        }}
          onClick={this.submit}>Добавить</button>

        <div id='places'>
          <button style={{ width: 'auto',
           outline: 'none', background: 'green',
            color: 'white', display: 'block', 
            margin: '1vw auto 1vw auto', 
            cursor: 'pointer', height: '3vw', border: 'none', 
            borderRadius: '10px', font: '400 1.5vw Montserrat' }} 
            onClick={this.get}>Отобразить Сохраненные города</button>
          {
            this.state.items.map(item => {
              return <div
                style={{ display: 'flex', margin: '1vw 0 0 0', justifyContent: 'space-between', font: '400 1.5vw Montserrat' }}
                key={item.id}><a href="#" onClick={e => this.onClickAnchor(item.coordinate)}>{item.Name}</a>
                
                <button style={{ background: 
                'red', outline: 'none', 
                color: 'white', border: 'none',
                 borderRadius: '.5vw' }} 
                 onClick={() => this.delete(item.id)}>Удалить</button></div>
            })
          }
        </div>
          
         <div style={{ height: '30vh', width: '50vw', display:'block', margin:'3vw auto 5vw auto' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyAB-aFOpDxUYUW5mMcgGs4pdixttKnu4EM' }}
            center={this.state.center}
            defaultZoom={this.state.zoom}
            ref="map"
            
          >
        </GoogleMapReact> 
        </div>
      </div>

    );
  }
}
export default App;
