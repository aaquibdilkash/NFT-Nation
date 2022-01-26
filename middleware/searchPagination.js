class SearchPagination {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search(type) {
    const keyword = this.queryStr.keyword
      ? (
        type === "pins" ? {
          $or: [
            // { _id: this.queryStr.keyword },
            { title: { $regex: this.queryStr.keyword, $options: "i" } },
            { about: { $regex: this.queryStr.keyword, $options: "i" } },
            { seller: { $regex: this.queryStr.keyword, $options: "i" } },
            { owner: { $regex: this.queryStr.keyword, $options: "i" } },
            { "postedBy.userName": { $regex: this.queryStr.keyword, $options: "i" } },
            { "postedBy.address": { $regex: this.queryStr.keyword, $options: "i" } },
            { "createdBy.address": { $regex: this.queryStr.keyword, $options: "i" } },
            { "createdBy.userName": { $regex: this.queryStr.keyword, $options: "i" } },
          ],
        } : type === "collections" ? {
          $or: [
            // { _id: this.queryStr.keyword },
            { title: { $regex: this.queryStr.keyword, $options: "i" } },
            { about: { $regex: this.queryStr.keyword, $options: "i" } },
            { "createdBy.userName": { $regex: this.queryStr.keyword, $options: "i" } },
            { "createdBy.address": { $regex: this.queryStr.keyword, $options: "i" } },
          ],
        } : {
          $or: [
            // { _id: this.queryStr.keyword },
            { userName: { $regex: this.queryStr.keyword, $options: "i" } },
            { about: { $regex: this.queryStr.keyword, $options: "i" } },
            { address: { $regex: this.queryStr.keyword, $options: "i" } },
          ],
        }
      )
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // removing some fields for category
    const removedFields = ["keyword", "page", "saved", "bids", "feed", "sort", "ne", "followers", "followings", "commented"];

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
    // const keyword = this.queryStr.bids ? { "bids.user": this.queryStr.bids } : {};
    const keyword = this.queryStr.bids ? {bids: {$elemMatch: {user: this.queryStr.bids}}} : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  commented() {
    // const keyword = this.queryStr.commented ? { "comments.user": this.queryStr.commented } : {};
    const keyword = this.queryStr.commented ? {comments: {$elemMatch: {user: this.queryStr.commented}}} : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  feed(followings, type="pins") {
    const keyword = this.queryStr.feed ? (
      type === "pins" ? {"postedBy": {$in: followings}} : type === "collections" ? {"createdBy": {$in: followings}} : {}
    ) : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  collection(pins) {
    const keyword = this.queryStr.collection ? {"_id": {$in: pins}} : {};
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
