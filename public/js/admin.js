// 删除数据
$(function(){
    // 当有删除按钮被点击时
    $('.del').click(function(e){
        // 找到是哪个按钮被点击
        var target = $(e.target);
        // 取到对应按钮的id值
        var id = target.data('id');
        // 取到数据在列表页里面的哪一行
        var tr = $('.item-id-'+id);

        $.ajax({
            // 提交请求的类型
            type:'DELETE',
            // 请求提交的地址
            url:'/admin/list?id='+id
        }).done(function(results){
            // 删除后希望服务器返回一个状态
            if(results.success === 1){
                // 如果服务器端删除成功,那就判断列表页是不是有这一行
                if(tr.length > 0){
                    // 如果列表页有这一行则直接进行删除
                    tr.remove();
                }
            }
        });
    })
})