import { fisherYatesShuffle } from "./shared/project-utils/index.js"
import supermemo from "./supermemo.js"

addEventListener("load", () => {

  class SlideDiv {
    constructor(slide, pc, _i){
      this._i = _i
      this.slide = slide
      this.slide.setAttribute("tabindex", 0);

      this.front = this.slide.querySelector(".slide__front")
      this.back = this.slide.querySelector(".slide__back")
      this.gotIt = this.slide.querySelector(".slide__got-it")
      this.noGotIt = this.slide.querySelector(".slide__no-got-it")
      // this.slideWrapper = this.slide.querySelector(".slide__wrapper")

      this.type = this.slide.dataset.slideType
      this.word = this.slide.dataset.word
      this.key = Number(this.slide.dataset.key)
      this.efactor = Number(this.slide.dataset.efactor)
      this.interval = Number(this.slide.dataset.interval)
      this.repetition = Number(this.slide.dataset.repetition)

      this.correct = false
      this.opened = false

      try{
      if(this.type == "coverType"){
        var wordContainer = this.front.querySelector(".slide__word-container")
        wordContainer.removeChild(wordContainer.firstChild)

        //This assumes that coverTypes are 4 character words only
        var randomIndexes = fisherYatesShuffle([0,1,2,3]).slice(0,2)
        for (var i = 0; i < this.word.length; i++) {
          var span
          if(randomIndexes.includes(i)){
            span = ce("span", "hidden-char");
          }else{
            span = ce("span")
          }
          span.innerText = this.word[i]
          wordContainer.appendChild(span)
        }

      }
      }catch(e){
        console.log("Error: " +  e)
      }

      if(this.type == "examplesType"){

        try{
          const exampleEl = this.front.querySelector(".slide__sentences-container")
          // const exampleEl = this.front.firstChild
          // For fucks sake I don't get why firstChild doesn't return the same thing.
          const exampleSentence = exampleEl.innerText
          // console.log("key ", this.key)
          exampleEl.innerHTML = ""

          const matchIndex = exampleSentence.indexOf(this.word)
          // console.log("Match index", matchIndex)

          // console.log("random indexes", randomIndexes)
          for (var i = 0; i < exampleSentence.length; i++) {
            var span
            if(i >= matchIndex && i < matchIndex + this.word.length){
              span = ce("span", "hidden-char");
            }else{
              span = ce("span")
            }
            span.innerText = exampleSentence[i]
            exampleEl.appendChild(span)
          }

        }catch(e){
          console.log("ERR", e)
        }

      }

      this.sc = pc.appendChild(ce("div", "slide-container"));
      this.sc.appendChild(this.slide);
      this.setClickListeners()
    };

    flip(){
      if(this.opened){
        this.opened = false
        this.slide.classList.remove("slide--gridded")
      }else {
        this.opened = true
        this.slide.classList.add("slide--gridded")
      }
    }

    setClickListeners(){
      this.slide.addEventListener("click", onClickSlideContainer.bind(this));
      this.gotIt.addEventListener("click", onClickGotIt.bind(this));
      this.noGotIt.addEventListener("click", onClickNoGotIt.bind(this));

      function onClickSlideContainer(e) {
        // e.stopPropagation();
        e.preventDefault();
        this.flip()
      }

      function onClickGotIt(e){
        e.stopPropagation();
        e.preventDefault();

        if(big.current === big.length - 2){
          console.log("before last slide")
          //send batch updates to netlify serverless
          batchUpdate()
        }
        this.correct = true
        forward()
      }

      function onClickNoGotIt(e){
        e.stopPropagation();
        e.preventDefault();

        if(big.current === big.length - 2){
          console.log("before last slide")
          //send batch updates to netlify serverless
          batchUpdate()
        }
        this.correct = false
        forward()
      }
    }

  }

  let slideDivs = Array.from(document.querySelectorAll(".slide"));
  let pc = document.body.appendChild(ce("div", "presentation-container"));
  pc.classList.add("pc")

  slideDivs = slideDivs.map((slide, _i) => {
    return new SlideDiv(slide, pc, _i)
  });

  console.log("Printing slides")
  slideDivs.forEach(x => console.log(x.word))

  function batchUpdate(){
    const results = {}

    let tempStore = {}
    //When you have time, try and get /data.json to work so that you don't need to stuff data in html data attributes
    const newSlideDivs = slideDivs.slice(0, slideDivs.length - 1)
    for (let slideDiv of newSlideDivs) {
      let gradeAddition = slideDiv.correct ? (slideDiv.type === "examplesType" ? 1 : 2) : 0

      if(tempStore[slideDiv.word]){
        tempStore[slideDiv.word].grade += gradeAddition
      }else{
        tempStore[slideDiv.word] = {
          grade: gradeAddition,
          key: slideDiv.key,
          efactor: slideDiv.efactor,
          interval: slideDiv.interval,
          repetition: slideDiv.repetition,
        }
      }
    }

    console.log("Before Supermemo" + tempStore)
    for(const [key, value] of Object.entries(tempStore)){
      supermemo(value, value.grade)
    }
    console.log("After supermemo", JSON.stringify(tempStore))

    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    console.log("BUILD DATA IN BIG.JS", JSON.stringify(buildData))
    tempStore["username"] = username
    tempStore["IANA"] = buildData["IANA"]
    tempStore["email"] = buildData["email"]

    fetch(
      'http://158.247.193.21:8888/.netlify/functions/onpost',
      {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(tempStore)
      }
    )
      .then(x => x.json())
      .then(x => console.log(x))
      .catch(e => console.log(e))

  }

  let timeoutInterval,
    { body } = document,
    big = (window.big = {
      current: -1,
      length: slideDivs.length,
      forward,
      reverse,
      go
    });

  function forward() {
    go(big.current + 1);
  }

  function reverse() {
    go(big.current - 1);
  }

  function go(n, force) {
    n = Math.max(0, Math.min(big.length - 1, n));
    if (!force && big.current === n) return;
    var prevI = big.current
    big.current = n;
    let sc = slideDivs[n].sc,
      slide = slideDivs[n].slide;
    console.log("CURRENT SLIDE", slideDivs[n].word)

    for (let slideDiv of slideDivs) {
      if(slideDiv._i === prevI){
        slideDiv.sc.classList.replace("show", "hide")
      }else if(slideDiv._i === n){
        slideDiv.sc.classList.add("show")
      }
    }

    if (window.location.hash !== n) window.location.hash = n;
    document.title = slide.textContent;
  }

  function onKeyDown(e) {
    if (big.mode === "talk") {
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          return reverse();
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          return forward();
      }
    }
  }

  document.addEventListener("keydown", onKeyDown);

  addEventListener("hashchange", () => {
    go(parseHash());
  });

  go(parseHash() || big.current);
});

function parseHash() {
  return parseInt(window.location.hash.substring(1), 10);
}

function ce(type, className = "") {
  return Object.assign(document.createElement(type), { className });
}

