class creeperItem {
  constructor({ name = '', url = '', filter = '', construct = '' }, defaultCreeperObjectConstruct) {
    this.name = name,
      this.url = url,
      this.filter = filter,
      this.construct = Object.assign({}, defaultCreeperObjectConstruct, construct);
  }
}

module.exports = creeperItem;
