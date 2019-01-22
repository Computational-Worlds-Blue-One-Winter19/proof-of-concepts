function AssetManager() {
  this.successCount = 0;
  this.errorCount = 0;
  this.cache = [];
  this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function queueDownload(path) {
  console.log(`Queueing ${path}`);
  this.downloadQueue.push(path);
};

AssetManager.prototype.isDone = function isDone() {
  return this.downloadQueue.length === this.successCount + this.errorCount;
};

AssetManager.prototype.downloadAll = function downloadAll(callback) {
  for (let i = 0; i < this.downloadQueue.length; i += 1) {
    const img = new Image();
    var that = this;

    const path = this.downloadQueue[i];
    console.log(path);

    img.addEventListener('load', function addEventListener() {
      console.log(`Loaded ${this.src}`);
      that.successCount++;
      if (that.isDone()) callback();
    });

    img.addEventListener('error', function addEventListener() {
      console.log(`Error loading ${this.src}`);
      that.errorCount++;
      if (that.isDone()) callback();
    });

    img.src = path;
    this.cache[path] = img;
  }
};

AssetManager.prototype.getAsset = function (path) {
  return this.cache[path];
};
