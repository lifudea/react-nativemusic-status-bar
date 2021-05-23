
# react-nativemusic-status-bar
## android还没搞完

## 使用方法（ios安装依赖在下面）
    //安装包
    npm i react-native-music-status-bar
    
    import MusicStatusBar from 'react-native-music-status-bar'
    const list = [{
        musicSrc:"https://mp3.9ku.com/hot/2004/07-17/42620.mp3",
        musicTitle:"千千阙歌",
        author:"陈慧娴",
        iconImg:"https://img0.baidu.com/it/u=3880341262,3308316348&fm=26&fmt=auto&gp=0.jpg",
        backImg:"https://img1.baidu.com/it/u=1485012388,2380514454&fm=26&fmt=auto&gp=0.jpg"
    }
    return(
        <MusicStatusBar musicList={list}></MusicStatusBar>
    )

## ios安装包

### 1、cd ios
### 2、在podfile文件中添加 pod 'RNMusicStatusBar', :path => '../node_modules/react-native-music-status-bar/ios'（也可以在Libraries中导入"/node_modules/react-native-music-status-bar/ios/RNDemo.xcodeproj"）
### 3、pod install
### 4、在AppDelegate.m中添加后台播放功能
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    //后台播放
    AVAudioSession *session = [AVAudioSession sharedInstance];
    [session setActive:YES error:nil];
    [session setCategory:AVAudioSessionCategoryPlayback error:nil];
}
### 5、运行项目
