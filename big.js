import fisherYatesShuffle from "./shared/fisher-yates-shuffle/index.js"
import supermemo from "./supermemo.js"

function parseHash() {
  return parseInt(window.location.hash.substring(1), 10);
}

function emptyNode(node) {
  while (node.hasChildNodes()) node.removeChild(node.lastChild);
}

function ce(type, className = "") {
  return Object.assign(document.createElement(type), { className });
}

addEventListener("load", () => {

  class SlideDiv {
    constructor(slide, pc, _i){
      console.log(supermemo.toString())
      this._i = _i
      this.slide = slide
      this.slide.setAttribute("tabindex", 0);

      this.front = this.slide.querySelector(".slide__front")
      this.back = this.slide.querySelector(".slide__back")
      this.gotIt = this.slide.querySelector(".slide__got-it")
      this.noGotIt = this.slide.querySelector(".slide__no-got-it")

      this.type = this.slide.dataset.slideType
      this.word = this.slide.dataset.word
      this.key = Number(this.slide.dataset.key)
      this.efactor = Number(this.slide.dataset.efactor)
      this.interval = Number(this.slide.dataset.interval)
      this.repetition = Number(this.slide.dataset.repetition)

      this.correct = false
      this.opened = false

      if(this.type == "coverType"){
        this.front.removeChild(this.front.firstChild)

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
          this.front.appendChild(span)
        }

      }

      if(this.type == "examplesType"){

        try{
          const exampleEl = this.front.querySelector(".text-container")
          // const exampleEl = this.front.firstChild
          // For fucks sake I don't get why firstChild doesn't return the same thing.
          const exampleSentence = exampleEl.innerText
          console.log("example element", JSON.stringify(exampleEl))
          console.log("EXAMPLE SEN", exampleSentence)
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
      this.sc.addEventListener("click", onClickSlideContainer.bind(this));
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
        this.flip()
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
        this.flip()
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

  console.log(JSON.stringify(slideDivs))

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

    // for(let word of words){
    //   console.log("Word", JSON.stringify(word))
    //   var {interval, repetition, efactor} = supermemo(word, tempStore[word.word])
    //   word.interval = interval
    //   word.repetition = repetition
    //   word.efactor = efactor
    // }


    // console.log(JSON.stringify(results))
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
    {
      className: initialBodyClass,
      style: { cssText: initialBodyStyle }
    } = body,
    big = (window.big = {
      current: -1,
      mode: "talk",
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
    // if (sc._notes.length) {
    //   console.group(n);
    //   for (let note of sc._notes) console.log("%c%s", "padding:5px;font-family:serif;font-size:18px;line-height:150%;", note);
    //   console.groupEnd();
    // }

    // for (let slideDiv of slideDivs) slideDiv.sc.style.display = slideDiv._i === n ? "" : "none";
    for (let slideDiv of slideDivs) {
      if(slideDiv._i === prevI){
        slideDiv.sc.classList.replace("show", "hide")
      }else if(slideDiv._i === n){
        slideDiv.sc.classList.add("show")
      }
    }
    body.className = `talk-mode ${slide.dataset.bodyClass || ""} ${initialBodyClass}`;
    body.style.cssText = `${initialBodyStyle} ${slide.dataset.bodyStyle || ""}`;
    // window.clearInterval(timeoutInterval);
    // if (slideDiv.dataset.timeToNext) timeoutInterval = window.setTimeout(forward, parseFloat(slideDiv.dataset.timeToNext) * 1000);
    // Took out time function

    // onResize();
    if (window.location.hash !== n) window.location.hash = n;
    document.title = slide.textContent;
  }

  // function resizeTo(slideDiv, width, height) {
  //   let slide = slideDiv.slide,
  //     sc = slideDiv.sc,
  //     padding = Math.min(width * 0.04),
  //     fontSize = height;
  //   sc.style.width = `${width}px`;
  //   sc.style.height = `${height}px`;
  //   slide.style.padding = `${padding}px`;
  //   if (getComputedStyle(slide).display === "grid") slide.style.height = `${height - padding * 2}px`;
  //   for (let step of [100, 50, 10, 2]) {
  //     for (; fontSize > 0; fontSize -= step) {
  //       slide.style.fontSize = `${fontSize}px`;
  //       if (
  //         slide.scrollWidth <= width &&
  //         slide.offsetHeight <= height &&
  //         Array.from(slide.querySelectorAll("div")).every(elem => elem.scrollWidth <= elem.clientWidth && elem.scrollHeight <= elem.clientHeight)
  //       ) {
  //         break;
  //       }
  //     }
  //     fontSize += step;
  //   }
  // }

  function onTalk(i) {
    if (big.mode === "talk") return;
    big.mode = "talk";
    body.className = `talk-mode ${initialBodyClass}`;
    emptyNode(pc);
    for (let slideDiv of slideDivs) pc.appendChild(slideDiv.sc);
    go(i, true);
  }

  function onJump() {
    if (big.mode === "jump") return;
    big.mode = "jump";
    body.className = "jump-mode " + initialBodyClass;
    body.style.cssText = initialBodyStyle;
    emptyNode(pc);
    slideDivs.forEach(slideDiv => {
      let sc = slideDiv.sc
      let slide = slideDiv.slide
      let subContainer = pc.appendChild(ce("div", "sub-container"));
      subContainer.addEventListener("keypress", e => {
        if (e.key !== "Enter") return;
        subContainer.removeEventListener("click", onClickSlide);
        e.stopPropagation();
        e.preventDefault();
        onTalk(sc._i);
      });
      let sbc = subContainer.appendChild(ce("div", slide.dataset.bodyClass || ""));
      sbc.appendChild(sc);
      sc.style.display = "flex";
      sbc.style.cssText = sc.dataset.bodyStyle || "";
      // resizeTo(slideDiv, 192, 120);
      function onClickSlide(e) {
        subContainer.removeEventListener("click", onClickSlide);
        e.stopPropagation();
        e.preventDefault();
        onTalk(slideDiv._i);
      }
      subContainer.addEventListener("click", onClickSlide);
    });
  }

  function onClick(e) {
    if (big.mode !== "talk") return;
    // if (e.target.tagName !== "A") go((big.current + 1) % big.length);
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
    let m = { t: onTalk, j: onJump }[e.key];
    if (m) m(big.current);
  }

  // function onResize() {
  //   if (big.mode !== "talk") return;
  //   let { clientWidth: width, clientHeight: height } = document.documentElement;
  //   if (ASPECT_RATIO !== false) {
  //     if (width / height > ASPECT_RATIO) width = Math.ceil(height * ASPECT_RATIO);
  //     else height = Math.ceil(width / ASPECT_RATIO);
  //   }
  //   resizeTo(slideDivs[big.current], width, height);
  // }

  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeyDown);
  // document.addEventListener("touchstart", e => {
  //   if (big.mode !== "talk") return;
  //   let { pageX: startingPageX } = e.changedTouches[0];
  //   document.addEventListener(
  //     "touchend",
  //     e2 => {
  //       let distanceTraveled = e2.changedTouches[0].pageX - startingPageX;
  //       // Don't navigate if the person didn't swipe by fewer than 4 pixels
  //       if (Math.abs(distanceTraveled) < 4) return;
  //       if (distanceTraveled < 0) forward();
  //       else reverse();
  //     },
  //     { once: true }
  //   );
  // });
  addEventListener("hashchange", () => {
    if (big.mode === "talk") go(parseHash());
  });
  // addEventListener("resize", onResize);
  console.log("This is a big presentation. You can: \n\n* press j to jump to a slide\n" + "* press p to see the print view\n* press t to go back to the talk view");
  body.className = `talk-mode ${initialBodyClass}`;
  go(parseHash() || big.current);
});
