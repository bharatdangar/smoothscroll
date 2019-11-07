// https://codepen.io/osublake/pen/2d80ba2c61fb873bf4ebaafbad6a06f7 smooth scroll class

class SmoothScroll {
  endThreshold = 0.05;
  requestId = null;
  maxDepth = 10;
  viewHeight = 0;
  halfViewHeight = 0;
  maxDistance = 0;
  scrollHeight = 0;
  endScroll = 0;
  currentScroll = 0;
  resizeRequest = 1;
  scrollRequest = 0;
  scrollItems = [];
  lastTime = -1;
  maxElapsedMS = 100;
  targetFPMS = 0.06;

  constructor(options) {
    this.scrollBody = options.scrollBody;
    this.scrollSpacer = options.scrollSpacer;

    this.target = options.target;

    this.scrollEase = options.scrollEase != null ? options.scrollEase : 0.1;
    this.maxOffset = options.maxOffset != null ? options.maxOffset : 500;

    this.horizontalScrollWrapper = options.horizontalScrollWrapper;

    this.horizontalScroll = options.horizontalScroll;

    this.addItems();

    window.addEventListener("resize", this._onResize);
    // window.addEventListener("scroll", this._onScroll);
    this.scrollBody.addEventListener("scroll", this._onScroll);

    this._update();
  }

  _onResize = event => {
    this.resizeRequest++;
    if (!this.requestId) {
      this.lastTime = performance.now();
      this.requestId = requestAnimationFrame(this._update);
    }
  };

  _onScroll = event => {
    this.scrollRequest++;
    if (!this.requestId) {
      this.lastTime = performance.now();
      this.requestId = requestAnimationFrame(this._update);
    }
  };

  _update = (currentTime = performance.now()) => {
    let elapsedMS = currentTime - this.lastTime;

    if (elapsedMS > this.maxElapsedMS) {
      elapsedMS = this.maxElapsedMS;
    }

    const deltaTime = elapsedMS * this.targetFPMS;
    const dt = 1 - Math.pow(1 - this.scrollEase, deltaTime);

    const resized = this.resizeRequest > 0;
    // const scrollY = window.pageYOffset;
    const scrollY = this.scrollBody.scrollTop;

    if (resized) {
        let horScrHeight = 0;
        if(this.horizontalScroll !== null && this.horizontalScrollWrapper !== null){
            horScrHeight = this.horizontalScroll.clientWidth;
            this.horizontalScrollWrapper.style.height = horScrHeight+'px';
        }
        const height = this.target.clientHeight;
        // document.body.style.height = height + "px";
        this.scrollSpacer.style.height = height + "px";
        this.scrollHeight = height;
        this.viewHeight = window.innerHeight;
        this.halfViewHeight = this.viewHeight / 2;
        this.maxDistance = this.viewHeight * 2;
        this.resizeRequest = 0;
    }

    this.endScroll = scrollY;
    // this.currentScroll += (scrollY - this.currentScroll) * this.scrollEase;
    this.currentScroll += (scrollY - this.currentScroll) * dt;

    if (Math.abs(scrollY - this.currentScroll) < this.endThreshold || resized) {
      this.currentScroll = scrollY;
      this.scrollRequest = 0;
    }

    // const scrollOrigin = scrollY + this.halfViewHeight;
    const scrollOrigin = this.currentScroll + this.halfViewHeight;

    this.target.style.transform = `translate3d(0px,-${this.currentScroll}px,0px)`;

    for (let i = 0; i < this.scrollItems.length; i++) {
      const item = this.scrollItems[i];

      const distance = scrollOrigin - item.top;
      const offsetRatio = distance / this.maxDistance;

      item.endOffset = Math.round(
        this.maxOffset * item.depthRatio * offsetRatio
      );

      if (Math.abs(item.endOffset - item.currentOffset < this.endThreshold)) {
        item.currentOffset = item.endOffset;
      } else {
        // item.currentOffset += (item.endOffset - item.currentOffset) * this.scrollEase;
        item.currentOffset += (item.endOffset - item.currentOffset) * dt;
      }

      item.target.style.transform = `translate3d(0px,-${item.currentOffset}px,0px)`;
    }

    this.lastTime = currentTime;

    this.requestId =
      this.scrollRequest > 0 ? requestAnimationFrame(this._update) : null;
  };

  addItems() {
    this.scrollItems = [];
    const elements = document.querySelectorAll("*[data-depth]");

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const depth = +element.getAttribute("data-depth");
      const rect = element.getBoundingClientRect();
      const item = {
        target: element,
        depth: depth,
        // top: rect.top + window.pageYOffset,
        top: rect.top + this.scrollBody.scrollTop,
        depthRatio: depth / this.maxDepth,
        currentOffset: 0,
        endOffset: 0
      };
      this.scrollItems.push(item);
    }

    return this;
  }
}

document.documentElement.style.setProperty(
  "--scrollbar-size",
  getScrollbarSize() + "px"
);

var scroller = new SmoothScroll({
  scrollBody: document.querySelector(".scroll-content"),
  scrollSpacer: document.querySelector(".spacer"),
  target: document.querySelector(".scroll-container"), // element container to scroll
  scrollEase: 0.05,
  horizontalScrollWrapper: document.querySelector(".horizontal-scroll-wrapper"),
  horizontalScroll: document.querySelector(".horizontal-scroll"),
});

function getScrollbarSize() {
  var div = document.createElement("div");
  div.classList.add("scrollbar-test");
  document.body.appendChild(div);
  var size = div.offsetWidth - div.scrollWidth;
  document.body.removeChild(div);
  return size;
}