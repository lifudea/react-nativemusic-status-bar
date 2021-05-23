
const changeSecondToMinutes = (num:number) => {    //秒数转为分钟：120 = > 02:00  361 => 01:00:00
        let text:string | number = "";  //显示在屏幕上的文字
        let hours = 0;    //小时
        let minute = 0; //分钟
        let second = 0;    //秒

        if(num > 60){
                second = num %60
                minute = (num - second)/60
        }else{
                minute = 0
                second = num
        }
        second = parseInt(String(second))
        text = (minute>=10?minute:"0" + minute) + ":" + (second>=10?second:"0" + second)
        return text
}

export {changeSecondToMinutes}