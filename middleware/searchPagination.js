class SearchPagination {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          $or: [
            { title: { $regex: this.queryStr.keyword, $options: "i" } },
            { about: { $regex: this.queryStr.keyword, $options: "i" } },
            { seller: { $regex: this.queryStr.keyword, $options: "i" } },
            { owner: { $regex: this.queryStr.keyword, $options: "i" } },
            { "postedBy._id": { $regex: this.queryStr.keyword, $options: "i" } },
          ],
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // removing some fields for category
    const removedFields = ["keyword", "page", "saved", "bids", "feed", "sort", "ne", "followers", "followings"];

    removedFields.forEach((key) => {
      delete queryCopy[key];
    });


    let queryStr = JSON.stringify(queryCopy);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  notin() {
    const keyword = this.queryStr.ne ? { "_id": { "$ne": this.queryStr.ne } } : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  sorted() {
    const sortMethod = this.queryStr.sort ?? "-createdAt"
    const keyword = sortMethod.includes("price") ? { "price": { "$ne": "0.0" } } : sortMethod.includes("bids") ? {"auctionEnded": false} : {};
    this.query = this.query.find({ ...keyword }).sort(sortMethod);
    return this;
  }

  saved() {
    const keyword = this.queryStr.saved ? { saved: this.queryStr.saved } : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  bids() {
    const keyword = this.queryStr.bids ? { "bids.user": this.queryStr.bids } : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  feed(followings) {
    const keyword = this.queryStr.feed ? {"postedBy": {$in: followings}} : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }
  
  follow(type, array) {
    const keyword = this.queryStr[`${type}`] ? {"_id": {$in: array}} : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;

    const skip = (currentPage - 1) * resultPerPage;

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = SearchPagination;
