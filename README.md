# Sleep Tracker
## Setup
1. Install Quasar CLI: `npm i -g @quasar/cli`.
2. Install these npm packages: `axios`
3. Enter `cd ./frontend`, then run `quasar dev -m pwa`.
4. Install node from the website, if it is not installed already. 
5. Install `npm install dotenv`
6. Open new terminal and enter `cd ./backend`, then run `node ./index.js`. 
7. Install ngrok and run `ngrok http 8080`. *(remove later and find a better alternative)*
8. Open the Website(IP-address and 9200 port number) on your Smartphone. (Phone and the server should be on the same IP-address!)
9. Ignore the warnings by the browser. 

!CHECK IT BEFORE SUBMISSION

## Formulas:
* To calculate `stroke-linecap` for time indicaton$^7$:
$$
2 \cdot \pi * R
$$
* To convert time to coordinates
$$
degrees = (hours \space \% \space 12) \cdot 30^\circ + minutes \space \cdot \space 0.5^\circ
$$
$$
x = Size + R \sin(degrees)
$$
$$
y = Size + R \cos(degrees)
$$




## References:
1. Vue.js Documentation Tutorials. [Tutorials Link](https://vuejs.org/tutorial/). 
2. Make Apps With Danny. [Video link](https://www.youtube.com/watch?v=PjCqsf87Z1Y). *To get started with the UI*
3. jeetvora331. [Throttling in JavaScript Easiest Explanation](https://dev.to/jeetvora331/throttling-in-javascript-easiest-explanation-1081). 
4. mdn. [Window: setInterval() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
5. ngrok. [ngrok.com/docs](https://ngrok.com/docs). 
6. Quasar Style & Identity Documentation. [https://quasar.dev/style/theme-builder](https://quasar.dev/style/theme-builder)
7. Stackoverflow. [https://stackoverflow.com/questions/69169928/i-need-to-make-a-circular-progress-bar-with-rounded-ends](https://stackoverflow.com/questions/69169928/i-need-to-make-a-circular-progress-bar-with-rounded-ends)
8. Sam Meech-Ward. *Easily Deploy Full Stack Node.js Apps on AWS EC2 | Step-by-Step Tutorial.* [https://www.youtube.com/watch?v=nQdyiK7-VlQ](https://www.youtube.com/watch?v=nQdyiK7-VlQ)