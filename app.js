// express node应用搭建模块
var express = require('express');
//var serveStatic = require('serve-static');

// 加载表单序列化模块
var bodyParser = require('body-parser');

// 加载mongoDB数据处理模块
var mongoose = require('mongoose');

// 加载mongoDB数据模型集
var Movie = require('./models/movie.js');

// 加载函数库
var _ = require('underscore');

// 端口设置
// 'process.env.PORT'是指Node环境中默认的端口
var port = process.env.PORT || 3000;

// 加载路径处理模块
var path = require('path');
var app = express();

// 连接本地数据库,将数据库的名称叫成'imooc'
mongoose.connect('mongodb://localhost/imooc');

// 设置视图路径
app.set('views','./views/pages');

// 设置模板引擎为jade
app.set('view engine','jade');

// 格式化表单里的数据,设置为true就可以
app.use( express.static( path.join(__dirname, 'public') ) )
app.use(bodyParser.urlencoded({extended: true}));
//app.use(serveStatic('bower_components'));

// 加载时间处理模块
app.locals.moment = require('moment');

// 监听端口
app.listen(port);

console.log('imooc started on port ' + port);

// index page
app.get('/',function(req,res){
    // 实现首页的查询逻辑(因为是静态方法所以可以直接调用,movies是通过find查找到的对象)
    // 查询到数据库中所有的数据并按照更新时间进行排序,最后执行传入的回调函数
    Movie.fetch(function(err,movies){
        if(err){
            console.log(err);
        }
        // render是express框架中用来根据接收到的不同路由渲染不同视图文件的函数
        // 第二个参数对象是传入页面中用来修改页面中变量的
        res.render('index',{
           title:'imooc 首页',
           movies:movies
        });
    })
});

// detail page
app.get('/movie/:id',function(req,res){
    // 获取路由里面的id值
    // 'request.params'是通过post和get传过来值的集合
    var id = req.params.id;

    // 调用静态方法 
    Movie.findById(id,function(err,movie){
        // render是express框架中用来根据接收到的不同路由渲染不同视图文件的函数
        res.render('detail',{
          title:'imooc ' + movie.title,
          movie:movie
        });
    });
});

// admin page
app.get('/admin/movie',function(req,res){
    res.render('admin',{
        title:'imooc 后台录入页',
        movie:{
            title:'',
            doctor:'',
            country:'',
            year:'',
            poster:'',
            flash:'',
            summary:'',
            language:''
        }
    });
});

// admin update movie 在后台更新时需要将页面转到详情页且同时详情页里必须包含已存在的数据
app.get('/admin/update/:id',function(req,res){
    // 'request.params'是通过post和get传过来值的集合
    var id = req.params.id;

    if(id){
        // 如果id存在则通过模型拿到电影数据,然后用拿到的数据借助render方法渲染admin页面
        Movie.findById(id,function(err,movie){
            // 拿到数据后渲染表单,也就是后台录入页,从而展现给用户
            res.render('admin',{
                title:'imooc 后台更新页',
                movie:movie
            })
        })
    }
})

// admin post movie 拿到用户从录入页表单POST过来的数据
// 用户提交数据的表单的action就是定位到'/admin/movie/new',从而触发这个路由
app.post('/admin/movie/new',function(req,res){
    // 从表单post过来的数据可能是新的也可能是更新过的
    var id = req.body.movie._id;
    // 获取用户在录入页输入的数据
    var movieObj = req.body.movie;
    var _movie;

    // 如果id有值则说明电影之前已经被存入数据库,这里需要更新操作
    if(id !== 'undefined'){
        Movie.findById(id,function(err,movie){
            if(err){
                console.log(err);
            }

            // 调用underscore里的extend方法用新的movieObj覆盖原来的数据movie
            _movie = _.extend(movie,movieObj);
            // 将更新之后的对象进行保存
            _movie.save(function(err,movie){
                if(err){
                    console.log(err);
                }
                // 将页面重定向到更新后的电影详情页中
                res.redirect('/movie/' + movie._id);
            })
        })
    }else{
        // 如果id不存在则说明是一部新电影,则调用模型构造函数构造一个Entity变量
        _movie = new Movie({
            doctor:movieObj.doctor,
            title:movieObj.title,
            country:movieObj.country,
            language:movieObj.language,
            year:movieObj.year,
            poster:movieObj.poster,
            summary:movieObj.summary,
            flash:movieObj.flash 
        });

        // 进行保存并重定向
        _movie.save(function(err,movie){
            if(err){
                console.log(err);
            }
            res.redirect('/movie/' + movie._id)
        })
    }
})

// list page
app.get('/admin/list',function(req,res){
    // 调用fetch方法将所有的数据全部查出并排序返回
    Movie.fetch(function(err,movies){
        if(err){
            console.log(err);
        }

        // render是express框架中用来根据接收到的不同路由渲染不同视图文件的函数
        res.render('list',{
           title:'imooc 列表页',
           movies:movies
        });
    })
});

// list delete movie 在列表页中进行删除操作的时候所触发
// Express中实例对象的delete方法接收客户端提交的DELETE请求并返回服务器端响应结果
app.delete('/admin/list',function(req,res){
    var id = req.query.id;

    if(id){
        // 调用模型的remove方法来删除,第一个参数是要删除的条件
        Movie.remove({_id:id},function(err,movie){
            if(err){
                console.log(err);
            }else{
                // 给客户端返回一段json数据
                // 数值是1,正好对应$.ajax里的done方法
                res.json({success:1})
            }
        });
    }
})
