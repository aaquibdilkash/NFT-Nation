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
          ],
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // removing some fields for category
    const removedFields = ["keyword", "page", "saved", "bids"];

    removedFields.forEach((key) => {
      delete queryCopy[key];
    });


    let queryStr = JSON.stringify(queryCopy);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  saved() {
    const keyword = this.queryStr.saved ? { saved: this.queryStr.saved } : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  bids() {
    const keyword = this.queryStr.bids ? { saved: this.queryStr.bids } : {};

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
