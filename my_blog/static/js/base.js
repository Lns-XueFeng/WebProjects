// 返回顶部
var turn = document.querySelector('#return');

window.onscroll = function(){
    turn.style.display = "block";

    if (window.scrollY == 0){
        turn.style.display = "none";
    }
}

turn.addEventListener("click", function(){
    var timer = setInterval(function(){
        document.documentElement.scrollTop -= 50;
        // 如果到顶部了就停止Interval
        if (document.documentElement.scrollTop < 1){
            // 执行设置表关
            clearInterval(timer)
        }
    })
})