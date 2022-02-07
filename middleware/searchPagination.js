class SearchPagination {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search(type) {
    const keyword = this.queryStr.keyword
      ? type === "pins"
        ? {
            $or: [
              { title: { $regex: this.queryStr.keyword, $options: "i" } },
              { about: { $regex: this.queryStr.keyword, $options: "i" } },
              { tokenId: { $regex: this.queryStr.keyword, $options: "i" } },
              { nftContract: { $regex: this.queryStr.keyword, $options: "i" } },
              {
                "postedBy.userName": {
                  $regex: this.queryStr.keyword,
                  $options: "i",
                },
              },
              {
                "postedBy._id": {
                  $regex: this.queryStr.keyword,
                  $options: "i",
                },
              },
              {
                "createdBy._id": {
                  $regex: this.queryStr.keyword,
                  $options: "i",
                },
              },
              {
                "createdBy.userName": {
                  $regex: this.queryStr.keyword,
                  $options: "i",
                },
              },
            ],
          }
        : type === "collections"
        ? {
            $or: [
              { title: { $regex: this.queryStr.keyword, $options: "i" } },
              { about: { $regex: this.queryStr.keyword, $options: "i" } },
              {
                "createdBy.userName": {
                  $regex: this.queryStr.keyword,
                  $options: "i",
                },
              },
              {
                "createdBy._id": {
                  $regex: this.queryStr.keyword,
                  $options: "i",
                },
              },
            ],
          }
        : {
            $or: [
              { userName: { $regex: this.queryStr.keyword, $options: "i" } },
              { about: { $regex: this.queryStr.keyword, $options: "i" } },
              { _id: { $regex: this.queryStr.keyword, $options: "i" } },
            ],
          }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // removing some fields for category
    const removedFields = ["keyword", "page", "feed", "sort", "ne"];

    removedFields.forEach((key) => {
      delete queryCopy[key];
    });

    let queryStr = JSON.stringify(queryCopy);

    this.query = this.query.find(JSON.parse(queryStr));
    // console.log(JSON.parse(queryStr), "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")

    return this;
  }

  notin() {
    const keyword = this.queryStr.ne ? { _id: { $ne: this.queryStr.ne } } : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  sorted() {
    const sortMethod = this.queryStr.sort ?? "-createdAt";
    const keyword = sortMethod.includes("price")
      ? { onSale: true, auctionEnded: true }
      : sortMethod.includes("bids")
      ? { auctionEnded: false, onSale: false }
      : sortMethod.includes("offersCount") ? { auctionEnded: true, onSale: false } : {};
    this.query = this.query.find({ ...keyword }).sort(sortMethod);
    return this;
  }

  feed(type = "pins", followings = [], followers = []) {
    // const keyword = this.queryStr.feed ? (
    //   type === "pins" ? {"postedBy": {$in: followings}} : type === "collections" ? {"createdBy": {$in: followings}} : {}
    // ) : {};

    const keyword = this.queryStr.feed
      ? type === "pins"
        ? {
            $or: [
              { postedBy: { $in: followings } },
              { createdBy: { $in: followings } },
            ],
          }
        : type === "collections"
        ? { createdBy: { $in: followings } }
        : {
            // $or: [{ followings: { $elemMatch: { _id: { $in: followings } } } }],
          }
      : {};


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
