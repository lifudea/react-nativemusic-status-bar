import React,{useState,useContext,useEffect} from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    NativeModules,
    Dimensions,
    Image,
    TouchableOpacity,
    Platform,
    DeviceEventEmitter,
    NativeEventEmitter,
    TouchableOpacityComponent,
    FlatList,
    Modal
} from 'react-native';

type RNMusicStatusBarMusic = {
    /**
     * 创建音频对象
     */
    createMusic:Function,
    /**
     * 开始播放音乐
     */
    startMusic:Function,
    /**
     * 暂停播放音乐
     */
    pauseMusic:Function,
    /**
     * 跳转到指定百分比播放
     * @param val 跳转百分比
     */
    jumpTime:(val:number)=>void,
    /**
     * 快进
     * @param val:快进时长（单位：秒）
     */
    advance:(val:number)=>void,
    /**
     * 快退
     * @param val:快退时长（单位：秒）
     */
    retreat:(val:number)=>void,
    /**
     * 停止播放音乐
     */
    stopMusic:Function
}
const RNMusicStatusBarMusic:RNMusicStatusBarMusic = NativeModules.RNMusicStatusBarMusic;
import Slider from '@react-native-community/slider';
import {changeSecondToMinutes} from './utils/index'
import {screenHeight} from './utils/size'


type propsType = {
    musicList:Array<{
        //歌曲地址
        musicSrc:string,
        //歌曲图标（装坛栏显示的图标）
        iconImg:string,
        //背景图片
        backImg?:string,
        //歌曲名称
        musicTitle:string,
        //歌曲作者
        author:string,
    }>
}
const App = (props:propsType) => {
    const _keyExtractor = (item:any) => item.id;
    //音频播放列表
    const [musicList,setMusicList] = useState(props.musicList);
    //当前播放第几个音频
    const [currentIndex,setCurrentIndex] = useState(0)
    //当前播放时长
    const [currentTime,setCurrentTime] = useState(0);
    //歌曲总时长
    const [duration,setDuration] = useState(0);
    //当前音频播放状态  true:正在播放、false暂停播放
    const [musicState,setMusicState] = useState(false);
    //滑动组件value
    const [sliderValue,setSliderValue] = useState(0);
    //是否显示音频播放列表  true显示 false不显示
    const [showMusicList,setShowMusicList] = useState(false);
    let listener:any = null;
    let listenerClick:any = null;
    
    useEffect(()=>{
        return ()=>{
            stopMusic();
        }
    },[])
    useEffect(()=>{
        if(!!musicState){
            RNMusicStatusBarMusic.startMusic();
        }
    },[musicState])

    useEffect(()=>{
        setMusicState(false);
        setDuration(0);
        createMusic(true);
    },[currentIndex])

    /**
     * 创建音频对象
     * @param isPlay:创建音频对象成功后是否直接播放音频
     */
    const createMusic = (isPlay?:boolean) => {
        const {musicTitle,author,iconImg,musicSrc} = musicList[currentIndex];
        RNMusicStatusBarMusic.createMusic(
            musicTitle,
            author,
            iconImg,
            musicSrc,
            computedNextExist(),
            computedPrevExist(),
        ).then((val1:any)=>{
            if(!!isPlay){
                startMusic();
            }
            setDuration(val1)

            // android和ios接收事件的方法不一样
            if(Platform.OS==='android'){
                listener = DeviceEventEmitter.addListener('listenerMusicTime', (val:any) => {
                    setCurrentTime(val)
                    setSliderValue(val/val1)
                })
            }else{
                const calendarmanagerEmitter = new NativeEventEmitter(NativeModules.RNMusicStatusBarMusic);
                calendarmanagerEmitter.addListener("listenerMusicTime",(val)=>{
                    if(!!parseInt(val)){
                        setCurrentTime(val)
                        setSliderValue(val/val1)
                    }else{
                        setCurrentTime(0)
                        setSliderValue(0)
                    }
                })
            }
            //监听原生端触发端事件
            listenerClick = DeviceEventEmitter.addListener('musicClick', (val:any) => {
                if(val == 'pause'){
                    //暂停播放
                    pauseMusic();
                }else if(val == "start"){
                    //开始播放
                    startMusic();
                }else if(val == "close"){
                    //停止播放
                    stopMusic();
                }else if(val == "playEnd"){
                    //播放完成
                    pauseMusic();
                    stopMusic();
                }else if(val == "next"){
                    //下一首
                    nextMusic();
                }else if(val == "prev"){
                    //上一首
                    prevMusic();
                }else{
                    pauseMusic();
                }
            })
        })
    }

    /**
     * 计算下一首是否存在 true:存在 false已经是最后一首了
     */
    const computedNextExist = () => {
        if(currentIndex < musicList.length - 1){
            return true;
        }else{
            return false;
        }
    }

    /**
     * 计算上一首是否存在 true:存在 false已经是最后一首了
     */
    const computedPrevExist = () => {
        if(currentIndex == 0){
            return false;
        }else{
            return true
        }
    }

    /**
     * 开始播放音乐
     */
    const startMusic = () => {
        setMusicState(true)
    }
    
    /**
     * 暂停播放音乐
     */
    const pauseMusic = () => {
        setMusicState(false)
        RNMusicStatusBarMusic.pauseMusic()
    }

    /**
     * 停止播放音乐
     */
    const stopMusic = () => {
        RNMusicStatusBarMusic.stopMusic()
    }

    /**
     * 跳转播放进度
     * @param time:跳转百分比
     */
    const jumpTime = (time:number) => {
        RNMusicStatusBarMusic.jumpTime(time)
    }

    /**
     * 快退
     */
    const retreat = () => {
        RNMusicStatusBarMusic.retreat(15)
        setSliderValue(currentTime/duration)
    }

    /**
     * 快进
     */
    const advance = () => {
        RNMusicStatusBarMusic.advance(15)
        setSliderValue(currentTime/duration)
    }

    //用户释放滑块时到回调、无论值是否更改、将当前值作为参数传递给回调处理程序
    const onSlidingComplete = (val:any) => {
        jumpTime(val)
    }
    
    /**
     * 是否显示音频列表
     */
    const changeShowMusicList = () => {
        if(!!showMusicList){
            setShowMusicList(false)
        }else{
            setShowMusicList(true)
        }
    }
    
    /**
     * 移除音频
     */
    const removeMusicItem = (index:number) => {
        setMusicList(()=>{
            musicList.splice(index,1)
            return [...musicList];
        })
    }

    /**
     * 切歌
     */
    const cutMusic = (index:number) => {
        setCurrentIndex(index);
    }

    /**
     * 上一曲
     */
    const prevMusic = () => {
        if(computedPrevExist()){
            setSliderValue(0);
            setCurrentIndex(currentIndex - 1);
        }
    }

    /**
     * 下一曲
     */
    const nextMusic = () => {
        if(computedNextExist()){
            setSliderValue(0);
            setCurrentIndex(currentIndex + 1);
        }
    }
    
    return (
        <View style={styles.box}>
            {!!musicList && !!musicList[currentIndex] && (
                <Image style={styles.bakcImg} source={{uri:musicList[currentIndex].backImg?musicList[currentIndex].backImg:musicList[currentIndex].iconImg}}></Image>
            )}
            {!!musicList && !!musicList[currentIndex] && (
                <View style={styles.titleBox}>
                    <Text style={styles.musicTitle}
                        numberOfLines={1}
                    >{musicList[currentIndex].musicTitle}</Text>
                    <Text style={styles.musicAuthor}>{musicList[currentIndex].author}</Text>
                </View>
            )}
            <View style={styles.controlBox}>
                <View style={styles.musicList}>
                    <TouchableOpacity onPress={changeShowMusicList}>
                        <Image style={styles.iconImg} source={require('./assets/gengduo-2.png')}></Image>
                    </TouchableOpacity>
                </View>
                <View style={styles.sliderBox}>
                    <Text style={styles.timeText}>{changeSecondToMinutes(currentTime)}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={1}
                        minimumTrackTintColor="#FFFFFF"
                        maximumTrackTintColor="#000000"
                        onSlidingComplete={onSlidingComplete}
                        onTouchStart={()=>{
                            pauseMusic()
                        }}
                        onTouchEnd={()=>{
                                startMusic();
                        }}
                        value={sliderValue}
                    />
                    <Text style={styles.timeText}>{changeSecondToMinutes(duration)}</Text>
                </View>
                <View style={styles.btnBox}>
                    <TouchableOpacity onPress={prevMusic}
                        disabled={!computedPrevExist()}
                    >
                        <Image style={styles.quickIcon} source={
                            computedPrevExist()?
                                require('./assets/shangyiqu.png')
                            :
                                require('./assets/shangyiquNo.png')
                        }></Image>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={!!musicState?pauseMusic:startMusic}>
                        <Image style={styles.startIcon} source={!!musicState?require('./assets/musicStopIcon.png'):require('./assets/musicStartIcon.png')}></Image>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={nextMusic}
                        disabled={!computedNextExist()}
                    >
                        <Image style={styles.quickIcon} source={
                            computedNextExist()?
                                require('./assets/xiayiqu.png')
                            :
                                require('./assets/xiayiquNo.png')
                        }></Image>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal
                visible={showMusicList}
                onRequestClose={()=>{
                    setShowMusicList(false)
                }}
                transparent={true}
                animationType={"slide"}
            >
                    <View style={styles.modalBox} 
                        onStartShouldSetResponder={()=>{
                            return true;
                        }}
                        onResponderStart={()=>{
                            setShowMusicList(false)
                        }}
                    >
                        <View style={styles.playList}>
                            <View style={styles.playContent}
                                onStartShouldSetResponder={()=>{
                                    return true;
                                }}
                            >
                                <FlatList data={musicList}
                                    keyExtractor={_keyExtractor}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({item,index})=>{
                                        return (
                                            <View style={
                                                currentIndex == index?styles.musicItemBoxSelect:styles.musicItemBox
                                            }
                                                onStartShouldSetResponder={()=>{
                                                    return true;
                                                }}
                                            >
                                                <View style={styles.itemLeft}>
                                                    <TouchableOpacity style={styles.itemLeft} onPress={()=>{
                                                        cutMusic(index)
                                                    }}>
                                                        <Text style={styles.musicTitleText}
                                                            numberOfLines={1}
                                                        >
                                                            {item.musicTitle} - 
                                                            <Text style={styles.musicAuthorText}>{item.author}</Text>
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <TouchableOpacity onPress={()=>{
                                                    removeMusicItem(index)
                                                }}>
                                                    <View style={styles.itemRight}>
                                                        <Image style={styles.removeImg} source={require('./assets/closeIcon.png')}></Image>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }}
                                ></FlatList>
                            </View>
                        </View>
                    </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    box:{
        width:"100%",
        height:"100%",
        display:"flex",
        flexDirection:"column",
        justifyContent:"space-between"
    },
    bakcImg:{
        position:"absolute",
        top:0,
        left:0,
        width:"100%",
        height:"100%"
    },
    titleBox:{
        display:"flex",
        flexDirection:"column",
        alignItems:"center"
    },
    musicTitle:{
        fontSize:26,
        color:"#000",
        fontWeight:"bold",
        textAlign:"center",
        marginTop:30,
        width:"80%"
    },
    musicAuthor:{
        fontSize:16,
        color:"#000",
        fontWeight:"bold",
        textAlign:"center",
        marginTop:10
    },
    controlBox:{
        marginBottom:20,
    },
    musicList:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"flex-end",
        paddingRight:10,
        position:"relative"
    },
    iconImg:{
        width:30,
        height:30
    },
    sliderBox:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"space-between",
        paddingLeft:10,
        paddingRight:10
    },
    slider:{
        flex:1
    },
    btnBox:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"space-around",
        alignItems:"center",
        marginTop:25
    },
    startIcon:{
        width:60,
        height:60
    },
    quickIcon:{
        width:40,
        height:40
    },
    timeText:{
        width:50,
        fontSize:16,
        textAlign:"center",
        textAlignVertical:"center",
        ...Platform.select({
            ios:{lineHeight:40},
            android:{}
        })
    },
    modalBox:{
        backgroundColor:"rgba(0,0,0,.5)",
        width:"100%",
        height:"100%",
        position:"relative"
    },
    playList:{
        width:"100%",
        position:"absolute",
        bottom:20,
        display:'flex',
        justifyContent:"center",
        alignItems:"center"
    },
    playContent:{
        width:"85%",
        backgroundColor:"#fff",
        height:screenHeight*.5,
        borderRadius:20,
        overflow:"hidden"
    },
    musicItemBox:{
        height:40,
        display:'flex',
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingRight:10,
        paddingLeft:10
    },
    musicItemBoxSelect:{
        height:40,
        display:'flex',
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingRight:10,
        paddingLeft:10,
        backgroundColor:"blue"
    },
    itemLeft:{
        display:'flex',
        flexDirection:"row",
        flex:1
    },
    itemRight:{
        width:30,
        height:30,
        display:'flex',
        justifyContent:"center",
        alignItems:"center"
    },
    removeImg:{
        width:17,
        height:17
    },
    musicTitleText:{
        fontSize:16
    },
    musicAuthorText:{
        fontSize:16,
        color:"#ccc"
    }
});

export default App;
