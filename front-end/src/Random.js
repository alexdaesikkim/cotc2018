import React from 'react';
import './Random.css';
import $ from 'jquery';
import {Input, Button} from 'react-materialize';

var createReactClass = require('create-react-class');

var Random = createReactClass({
  getInitialState(){
    return{
      game_data: [],
      panel: true,
      game_title: 'Loading...',
      game_name: '',
      games: [],
      version_name: '',
      versions: [],
      build_name: '',
      builds: [],
      game_limits:{
        min_level: 0,
        max_level: 0,
        min_diff: -1,
        max_diff: -1
      },
      min_level: 0,
      max_level: 0,
      min_diff: 0,
      max_diff: 0,
      diff_list: [],
      style: '',
      styles: [],
      protect_count: 2,
      cd_curr_num: 2,
      songs: [],
      undos: [],
      tie_breaker: false,
      errors:{
        error_messages: [],
        error_class: "no-error"
      }
    }
  },

  componentDidMount(){
    var that = this;
    $.ajax({
      url: '/api/alpha/info/all',
      method: 'GET',
      success: function(data){
        that.setState({
          game_title: 'Randomizer',
          game_data: data,
          games: Object.keys(data.games)
        });
      },
      error: function(data){
        that.setState({
          errors:{
            error_messages: ["Please reload the page and try again. If error persists, please contact admin (could not connect to back-end)"],
            error_class: "form-error"
          }
        })
      }
    })
  },

  changeGame(event){
    var game = event.target.value;
    if(game !== ''){
      for(var x = 0; x < this.state.games.length; x++){
        var g = this.state.games[x];
        if(g === game){
          var styles = this.state.game_data.games[g].styles;
          var versions = Object.keys(this.state.game_data.games[g].versions);
          var version_list = [];
          for(var i = 0; i < versions.length; i++){
            var key = versions[i];
            var version = this.state.game_data.games[g].versions[key];
            var pair = [];
            pair.push(key);
            pair.push(version.name);
            version_list.push(pair);
          }
          version_list.reverse();
          console.log(version_list[0][0])
          console.log(this.state.game_data.games[g].versions)
          var v = version_list[0][0]
          var builds = this.state.game_data.games[g].versions[v].builds;
          var diff_list = this.state.game_data.games[g].versions[v].difficulty.list;
          var game_title = this.state.game_data.games[g].name + " " + this.state.game_data.games[g].versions[v].name;
          if(styles.length > 1 && styles[styles.length-1] !== "all") styles.push("all");
          this.setState({
            game_name: game,
            game_title: 'Select Game',
            version_name: v,
            build_name: builds[0],
            builds: builds,
            styles: this.state.game_data.games[g].styles,
            style: this.state.game_data.games[g].styles[0],
            game_title: game_title,
            game_limits:{
              min_level: this.state.game_data.games[g].versions[v].level.min,
              max_level: this.state.game_data.games[g].versions[v].level.max,
              min_diff: this.state.game_data.games[g].versions[v].difficulty.min,
              max_diff: this.state.game_data.games[g].versions[v].difficulty.max
            },
            min_level: this.state.game_data.games[g].versions[v].level.min,
            max_level: this.state.game_data.games[g].versions[v].level.max,
            min_diff: this.state.game_data.games[g].versions[v].difficulty.min,
            max_diff: this.state.game_data.games[g].versions[v].difficulty.max,
            diff_list: diff_list,
            protect_count: 2,
            cd_curr_num: 2,
            versions: version_list,
            songs: []
          })
        }
      }
    }
  },

  errorCheck(){
    var error_messages = []
    if(this.state.min_level > this.state.max_level){
      error_messages.push("Min level cannot be higher than max level")
    }
    if(this.state.min_level < this.state.game_limits.min_level){
      error_messages.push("Min level should not fall under the game's level range")
    }
    if(this.state.max_level > this.state.game_limits.max_level){
      error_messages.push("Max level should not exceed the game's level range")
    }
    if(this.state.min_level > this.state.game_limits.max_level){
      error_messages.push("Min level should not exceed the game's level range")
    }
    if(this.state.max_level < this.state.game_limits.min_level){
      error_messages.push("Max level should not fall under the game's level range")
    }
    if(this.state.min_diff > this.state.max_diff){
      error_messages.push("Min difficulty cannot be higher than max difficulty")
    }
    if(error_messages.length > 0){
      console.log(error_messages)
      this.setState({
        errors:{
          error_messages: error_messages,
          error_class: "form-error"
        }
      })
      return true;
    }
    return false;

  },

  changeStyle(event){
    var style = event.target.value;
    this.setState({
      style: style
    })
  },

  changeMinLevel(event){
    this.setState({
      min_level: parseInt(event.target.value, 10)
    })
  },

  changeMaxLevel(event){
    this.setState({
      max_level: parseInt(event.target.value, 10)
    })
  },

  changeMinDifficulty(event){
    this.setState({
      min_diff: parseInt(event.target.value, 10)
    })
  },

  changeMaxDifficulty(event){
    this.setState({
      max_diff: parseInt(event.target.value, 10)
    })
  },

  changeTiebreakerSettings(){
    this.setState({
      tiebreaker: !this.state.tiebreaker
    })
  },

  handleRandomCall(){
    if(!this.errorCheck()){
      var that = this;
      var build = this.state.build_name;
      if(build.endsWith("(Current)")){
        build = build.slice(0,-9);
      }
      var song_count = (this.state.tiebreaker ? 1 : 5)
      var query = {
        count: song_count,
        build: build,
        min_difficulty: that.state.min_diff,
        max_difficulty: that.state.max_diff,
        min_level: that.state.min_level,
        max_level: that.state.max_level,
        style: that.state.style,
        north_america: that.state.north_america
      }
      $.ajax({
        url: '/api/alpha/random/' + that.state.game_name + "/" + that.state.version_name + "/",
        method: 'GET',
        data: query,
        success: function(data){
          var raw_songs = data.songs;
          var songs = [];
          var styles = that.state.styles;
          for(var i = 0; i < raw_songs.length; i++){
            var style = styles.length === 1 ? "" : raw_songs[i].style;
            var object = {
              id: i,
              name: raw_songs[i].title,
              artist: raw_songs[i].artist,
              bpm: raw_songs[i].bpm,
              genre: raw_songs[i].genre,
              source: raw_songs[i].source,
              level: raw_songs[i].level,
              style: style,
              difficulty: raw_songs[i].difficulty,
              version: raw_songs[i].version,
              protect: false,
              active: true
            }
            songs.push(object);
          }

          that.setState({
            songs: songs,
            panel: false,
            undos: [],
            tiebreaker: that.state.tiebreaker,
            protect_count: that.state.tiebreaker ? 0 : 2,
            cd_curr_num: that.state.tiebreaker ? 0 : 2,
            errors:{
              error_messages: [],
              error_class: "no-error"
            }
          });
        },
        error: function(data){
          that.setState({
            errors:{
              error_messages: [],
              error_class: "no-error"
            }
          })
        }
      })
    }
  },

  displayFormErrorPanel(){
    var errors = this.state.errors.error_messages.map(function(obj){
      return(
        <h6>{obj}</h6>
      )
    })
    return(
      <div className={this.state.errors.error_class}>
        <div className="col s12 m6 offset-m3">
          <h5>{this.state.errors.error_messages.length} error(s) prevented the form from submitting</h5>
          {errors}
        </div>
      </div>
    )
  },

  displayTopPanel(){
    var that = this;
    var games = this.state.games.map(function(obj){
      var game_name = obj.toUpperCase();
      return(
        <option value={obj} key={"gameselect_"+obj}>{game_name}</option>
      )
    });
    var styles = this.state.styles.map(function(obj){
      var style = obj.toUpperCase();
      return(
        <option value={obj} key={"styleselect_" + obj}>{style}</option>
      )
    });

    //need to work on version button (if done more than once, it doesn't change back to select version
    //since "" is only set with defaultvalue. see if there's a way to change its value onChange of game_name)
    if(this.state.panel){
      return(
        <div>
          <div className="row">
            {this.displayFormErrorPanel()}
          </div>
          <div className="row">
            <Input s={6} m={6} type='select' label="Game" value={this.state.game_name === '' ? "" : this.state.game_name} onChange={this.changeGame}>
              <option value="" key={"gaemselect_default"} disabled>Select Game</option>
              {games}
            </Input>
            <Input s={6} m={6} type='select' label="Play Style" value={this.state.style === '' ? '' : this.state.style} disabled={this.state.style === '' ? true : false} onChange={this.changeStyle}>
              {styles}
            </Input>
          </div>
        </div>
      );
    }
    else return null;

  },

  displaySubmitButton(){
    if(this.state.songs.length === 0){
      return(
        <div>
          <button className="btn btn-primary" onClick={this.handleRandomCall}>Grab Songs</button>
        </div>
      );
    }
    else return(
      <div>
        <button className="btn btn-primary" onClick={this.handleRandomCall}>Grab Songs</button>
        &ensp;&ensp;
        <button className="btn btn-primary" onClick={this.changePanelToggle}>Close Form</button>
      </div>
    );
  },

  displayLevelForm(){
    if(this.state.version_name !== ''){
      var that = this;
      var levels = [];
      for(var i = 0; i < this.state.game_limits.max_level; i++){
        levels.push(i+1);
      };

      var min_level_dropdown = levels.map(function(l){
        return(
          <option value={l} key={"min_level_" + l}>{l}</option>
        )
      });

      var max_level_dropdown = levels.map(function(l){
        return(
          <option value={l} key={"max_level_"+l}>{l}</option>
        )
      });
      var diff_ids = [];
      var diff_names = [];
      for(var j = 0; j < this.state.diff_list.length; j++){
        diff_ids.push(j);
        diff_names.push(j);
      };
      //sdvx edgecase
      if(this.state.diff_list.length-1 !== this.state.game_limits.max_diff){
        diff_ids[diff_ids.length-1] = this.state.game_limits.max_diff;
      }

      var min_diff_dropdown = diff_names.map(function(d){
        return(
          <option value={d} key={"min_diff_" + d}>{that.state.diff_list[parseInt(d, 10)]}</option>
        )
      });

      var max_diff_dropdown = diff_names.map(function(d){
        return(
          <option value={diff_ids[d]} key={"max_diff_" + d}>{that.state.diff_list[parseInt(d, 10)]}</option>
        )
      });

      return(
        <div>
          <div className="row">
            <Input s={6} m={2} label="Min Lvl" type='select' defaultValue={this.state.min_level} onChange={this.changeMinLevel}>
              {min_level_dropdown}
            </Input>
            <Input s={6} m={2} label="Max Lvl" type='select' defaultValue={this.state.max_level} onChange={this.changeMaxLevel}>
              {max_level_dropdown}
            </Input>
            <Input s={6} m={4} label="Min Diff" type='select' defaultValue={this.state.min_diff} onChange={this.changeMinDifficulty}>
              {min_diff_dropdown}
            </Input>
            <Input s={6} m={4} label="Max Diff" type='select' defaultValue={this.state.max_diff} onChange={this.changeMaxDifficulty}>
              {max_diff_dropdown}
            </Input>
          </div>
          <div className="row">
              <div className="center-forms">
                <Input name='cd_option' type='checkbox' label='Tiebreaker' checked={this.state.tiebreaker} onChange={this.changeTiebreakerSettings}></Input>
              </div>
          </div>
          <div className="row">
              {this.displaySubmitButton()}
          </div>
        </div>
      );
    }
    else return null;
  },

  //Toggle-Panel
  changePanelToggle(){
    this.setState({
      panel: !this.state.panel
    })
  },

  //changing props will change child value at the same time
  //NOT sure if this is react way of doing things. but in this case, it works
  undo(){
    if(this.state.undos.length > 2){
      var songs = this.state.songs;
      var undos = this.state.undos;
      var num = undos.pop();
      songs[num].active = true;
      this.setState({
        songs: songs,
        undos: undos,
        cd_curr_num: this.state.cd_curr_num+1
      })
    }
    else if(this.state.undos.length > 0){
      var songs = this.state.songs;
      var undos = this.state.undos;
      var num = undos.pop();
      songs[num].protect = false;
      this.setState({
        songs: songs,
        undos: undos,
        protect_count: this.state.protect_count+1
      })
    }
  },

  handleProtect(num){
    var songs = this.state.songs;
    songs[num].protect = true;
    var undos = this.state.undos;
    undos.push(num);
    var protect_count = this.state.protect_count-1;
    this.setState({
      songs: songs,
      undos: undos,
      protect_count: protect_count
    })
  },

  handleBans(num){
    console.log(num)
    var songs = this.state.songs;
    songs[num].active = false;
    var undos = this.state.undos;
    undos.push(num);
    var cd_curr_num = this.state.cd_curr_num-1;
    this.setState({
      songs: songs,
      undos: undos,
      cd_curr_num: cd_curr_num
    })
  },

  resetSongs(){
    var songs = this.state.songs;
    songs.map(function(obj){
      obj.protect = false;
      obj.active = true;
      return obj;
    })
    this.setState({
      songs: songs,
      undos: [],
      cd_curr_num: this.state.tiebreaker ? 0 : 2
    })
  },

  topPanelToggle(){
    if(this.state.panel){
      return(
        <div>
          {this.displayLevelForm()}
          <br/>
        </div>
      );
    }
    else{
      return(
        <div>
          <div>
            <button className="btn btn-primary" onClick={this.changePanelToggle}>Open Form</button>
          </div>
          <br/>
        </div>
      )
    }
  },

  menuButton(){
      if(!this.state.panel){
        return(
          <div>
            <Button floating fab='horizontal' fabClickOnly={true} icon='menu' className='gray' large style={{bottom: '25px', right: '25px'}}>
              <Button floating icon='undo' className={this.state.undos.length > 0 ? "deep-orange darken-4" : "disabled"} onClick={this.undo}/>
              <Button floating icon='replay' className={this.state.undos.length > 0 ? "blue" : "disabled"} onClick={this.resetSongs}/>
            </Button>
          </div>
        )
      }
  },

  protectPanel(){
    return(
      <div className="Protect-panel">
        <h4>Protect Phase</h4>
        <h5>{(this.state.protect_count) + " more song(s) to protect"}</h5>
      </div>
    )
  },

  banPanel(){
    return(
      <div className="Ban-panel">
        <h4>Veto Phase</h4>
        <h5>{(this.state.cd_curr_num) + " more song(s) to ban"}</h5>
      </div>
    )
  },

  infoPanel(){
    return(
      <div className="Info-panel">
        <h4>Song(s) to be Played</h4>
      </div>
    )
  },

  render() {
    var that = this;
    var song_cards = this.state.songs.map(function(obj){
      return(
        <Song song={obj} protect_panel={that.state.protect_count > 0} card_draw_panel={(!that.state.protect_count > 0 && that.state.cd_curr_num > 0)} game={that.state.game_name} version={that.state.version_name} difficulties={that.state.game_data.games[that.state.game_name].versions[that.state.version_name].difficulty.list} protect = {that.handleProtect} ban = {that.handleBans} key={obj.name + "_" + obj.difficulty} />
      )
    })
    return (
      <div>
        <div>
          <div className="Form-panel">
            <div className="container">
              <div className="row">
                <text className="title-text">{this.state.game_title}</text>
              </div>
              {this.displayTopPanel()}
              {this.topPanelToggle()}
            </div>
          </div>
        </div>
        {this.state.songs.length > 0 ? (this.state.protect_count > 0 && this.state.songs.length > 1 ? this.protectPanel() : (this.state.cd_curr_num && this.state.songs.length > 1 ? this.banPanel() : this.infoPanel())) : null}
        <div className="Song-container">
          {song_cards}
        </div>
        {this.menuButton()}
        <br/>
        <br/>
      </div>
    );
  }
});

var Song = createReactClass({

  diff_return(difficulty){
    var diff_string = this.props.difficulties[difficulty];
    var class_name = "card-";
    var classes = []
    if(this.props.game === 'ddr') classes = ['blue', 'yellow', 'red', 'green', 'purple']
    if(this.props.game === 'iidx') classes = ['green', 'blue', 'yellow', 'red', 'darkred']
    if(this.props.game === 'groovecoaster') classes = ['blue', 'yellow', 'red', 'gray']
    if(this.props.game === 'djmax') classes = ['blue', 'yellow', 'red']
    class_name += classes[difficulty]
    var object = {
      diff_string: diff_string,
      class_name: class_name,
    }
    return object;
  },

  changeBanClass(){
    this.props.ban(this.props.song.id);
  },

  changeProtectClass(){
    this.props.protect(this.props.song.id);
  },

  card_ban(){
    var url = "https://www.google.com/search?q=" + this.props.song.name + "+" + this.props.song.version + "+" + this.props.game
    if(this.props.protect_panel && !this.props.song.protect){
      return(
        <div>
          <a href={url} target="_blank"><i className="small material-icons">search</i></a>
          &ensp;&ensp;
          <i className="small material-icons" onClick={this.changeProtectClass}>check_circle_outline</i>
        </div>
      )
    }
    else if(this.props.card_draw_panel && !this.props.song.protect){
      return(
        <div>
          <a href={url} target="_blank"><i className="small material-icons">search</i></a>
          &ensp;&ensp;
          <i className="small material-icons" onClick={this.changeBanClass}>block</i>
        </div>
      )
    }
    else return(
      <div>
        <a href={url} target="_blank"><i className="small material-icons">search</i></a>
      </div>
    )
  },

  render() {
    var object = this.diff_return(this.props.song.difficulty);
    var difficulty = this.props.game === 'danevo' ? "Level " : object.diff_string + " ";
    var style =  this.props.song.style.charAt(0).toUpperCase() + this.props.song.style.slice(1)+ " ";
    var card_class = this.props.song.active ? object.class_name : "Song-card card-out"
    var level = this.props.song.level
    return (
      <div className={"Song-card " + card_class}>
        <h5>{this.props.song.name}</h5>
        <h6>{this.props.song.artist}</h6>
        {this.props.game === 'djmax' ? (
          <div>
            <h6>{style}</h6>
            <h6>{difficulty + this.props.song.level}</h6>
            <h6>{this.props.song.genre}</h6>
          </div>
          ):(
          <div>
            <h6>{style + difficulty} {this.props.song.level}</h6>
            <h6>{this.props.song.genre}</h6>
            <h6>{"BPM: " + this.props.song.bpm}</h6>
          </div>
          )
        }
        <h6>{this.props.song.version}</h6>
        <div>
          {this.card_ban()}
        </div>
      </div>
    );
  }
});

export default Random;
