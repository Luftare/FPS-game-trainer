var game;
var app;

Vue.component("timer-bar", {
	props: ["value"],
	template: `
		<div>
			<div v-bind:style="{ width: value + '%' }" style="height:10px; background-color:red; display:block;"></div>
		</div>
	`
});


document.addEventListener('DOMContentLoaded', () => {
	
  firebase.initializeApp({
   	databaseURL: "https://leaderboard-3c5ab.firebaseio.com/",
  });
		
	app = new Vue({
		el: "#root",
		data: {
			game: null,
			db: null,
			leaderboard: [],
		},
		computed: {
			topTen() {
				console.log(this.leaderboard)
				const arr = this.leaderboard.map(a => a).sort((a, b) => b.score - a.score);
				arr.length = 2;
				console.log(arr)
				return arr;
			}
		},
		mounted() {
			document.addEventListener("keydown", e => {
				if(e.key === "r") this.start();
			});
			window.onbeforeunload = () => {
				if(this.game) {
					localStorage.setItem("settings", JSON.stringify(this.game.settings));
				}
				return null;
			};
			input.setupEventListeners();
			this.start();
			this.db = firebase.database().ref("FPStrainer");
			this.db.orderByChild("score").limitToLast(20).on("value", snapshot => {
				const arr = [];
				snapshot.forEach(s => {
					arr.push(s.val());
				})
				this.leaderboard = arr.reverse();
			}, console.log);
			this.saveScore();
		},
		methods: {
			start() {
				if(this.game) this.game.end();
				const localSettingsJSON = localStorage.getItem("settings");
				const settings = localSettingsJSON? JSON.parse(localSettingsJSON) : {};
				game = new Game(game? game.settings : settings);
				this.game = game;
				this.game.start();
			},
			saveScore() {
				console.log(this.game, this.game.settings.name, this.game.state.score)
				if(this.game && this.game.settings.name && this.game.state.score > 0) {
					this.db.push().set({
						name: this.game.settings.name,
						score: this.game.state.score,
						time: Date.now(),
					});
				}
			}
		}
	});
});