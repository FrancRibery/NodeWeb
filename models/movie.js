var mongoose = require('mongoose');
var MovieSchema = require('../schemas/movie.js');

// 生成Movie模型,第一个参数是模型的名字
// 创建数据集Movie并得到数据模板Movie
// 其实相当于在数据库中已经准备了一个MovieSchema规则的数据集Movie
var Movie = mongoose.model('Movie',MovieSchema);

// 导出构造函数
module.exports = Movie;