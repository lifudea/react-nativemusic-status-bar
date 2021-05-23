//
//  Music.m
//  demo
//
//  Created by hello on 2021/5/10.
//

#import "RNMusicStatusBarMusic.h"


//音频远程控制器
static MPRemoteCommandCenter *commandCenter;

@interface RNMusicStatusBarMusic()

//@property AVAudioPlayer *musicPlayer;
//播放实例子
@property AVPlayer *musicPlayer;
//当前播放的音频
@property(nonatomic,strong)AVPlayerItem *currentItem;
@property NSTimer *timer;
//锁屏中心
@property(nonatomic,strong)MPNowPlayingInfoCenter *playingInfoCenter;
//初始化一个存放音乐信息的字典
@property(nonatomic,strong)NSMutableDictionary *playingInfoDict;
//当前歌曲进度监听者
@property(nonatomic,strong)id timeObserver;
@property(nonatomic,strong)RNMusicStatusBarMusicModel *model;
//下一首歌是否存在
@property(nonatomic,assign)BOOL nextExist;
//上一首歌曲是否存在
@property(nonatomic,assign)BOOL prevExist;

//设置锁屏界面
-(void)setLockScreenInfo:(RNMusicStatusBarMusicModel *)model;

@end

@implementation RNMusicStatusBarMusic

//为了实现RCTBridgeModule协议、你的类需要包含RCT_EXPORT_MODULE()宏
RCT_EXPORT_MODULE();


/*
创建音频对象
 title:音乐标题
 backImg:状态栏上显示的背景图片
 musicStr:音频地址
 nextExist:下一首歌曲是否存在
 prevExist:上一首歌曲是否存在
 return:音频总时长
 */
RCT_EXPORT_METHOD(
  createMusic:
  (NSString *) musicTitle
  andAuthor:(NSString *) author
  andIconImg:(NSString *) iconImg
  andMusicSrc:(NSString *) musicSrc
  andNextExist:(BOOL)nextExist
  andPrevExist:(BOOL)prevExist
  findEventsWithResolver:(RCTPromiseResolveBlock) resolve
  rejecter:(RCTPromiseRejectBlock) reject
  )
{
  self.nextExist = nextExist;
  self.prevExist = prevExist;
  if(self.musicPlayer != nil){
    [self stopMusic];
  }
  if(nextExist){
    commandCenter.nextTrackCommand.enabled = YES;
  }else{
    commandCenter.nextTrackCommand.enabled = NO;
  }
  if(prevExist){
    commandCenter.previousTrackCommand.enabled = YES;
  }else{
    commandCenter.previousTrackCommand.enabled = NO;
  }
  
  self.model = [[RNMusicStatusBarMusicModel alloc]initWithMusicTitle:musicTitle andAuthor:author andIconImg:iconImg andMusicSrc:musicSrc];
  NSURL *path = [NSURL fileURLWithPath:musicSrc];
  self.musicPlayer = [[AVPlayer alloc]init];
  self.currentItem = [[AVPlayerItem alloc]initWithURL:path];
  [self.musicPlayer replaceCurrentItemWithPlayerItem:self.currentItem];
  //音量
  self.musicPlayer.volume = 0.5;
  
  //获取音频总时长:CMTimeGetSeconds(self.musicPlayer.currentItem.asset.duration)
  float duration = CMTimeGetSeconds(self.musicPlayer.currentItem.asset.duration);
  resolve([NSString stringWithFormat:@"%f",duration]);
  self.model.durationTime = duration;
  
  //初始化存放音乐信息的字典
  self.playingInfoCenter = [MPNowPlayingInfoCenter defaultCenter];
  self.playingInfoDict = [NSMutableDictionary dictionary];
  [[[NSThread alloc]initWithTarget:self selector:@selector(setLockScreenInfo:) object:self.model] start];
  dispatch_async(dispatch_get_main_queue(),^{
    // 5.开启远程交互
    [[UIApplication sharedApplication] beginReceivingRemoteControlEvents];
    // 直接使用sharedCommandCenter来获取MPRemoteCommandCenter的shared实例
    commandCenter = [MPRemoteCommandCenter sharedCommandCenter];
    // 启用播放命令 (锁屏界面和上拉快捷功能菜单处的播放按钮触发的命令)
    commandCenter.playCommand.enabled = YES;
    // 为播放命令添加响应事件, 在点击后触发
    [commandCenter.playCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent * _Nonnull event) {
        [self sendEventWithName:@"musicClick" body:@"start"];
        //获取已经播放的时长self.musicPlayer.currentTime.value/self.musicPlayer.currentTime.timescale
        float currentTime = CMTimeGetSeconds(self.musicPlayer.currentItem.currentTime);
        NSString *currentStr = [NSString stringWithFormat:@"%d",(int)round(currentTime)];
        [self.playingInfoDict setObject:currentStr forKey:MPNowPlayingInfoPropertyElapsedPlaybackTime];
        self.playingInfoCenter.nowPlayingInfo = self.playingInfoDict;
        return MPRemoteCommandHandlerStatusSuccess;
    }];
    // 暂停播放命令 (锁屏界面和上拉快捷功能菜单处的播放按钮触发的命令)
    commandCenter.pauseCommand.enabled = YES;
    // 为暂停播放添加响应事件, 在点击后触发
    [commandCenter.pauseCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent * _Nonnull event) {
        //暂停播放
        [self sendEventWithName:@"musicClick" body:@"pause"];
        return MPRemoteCommandHandlerStatusSuccess;
    }];
    if(self.prevExist){
      [commandCenter.previousTrackCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent * _Nonnull event) {
        //上一首
        [self sendEventWithName:@"musicClick" body:@"prev"];
        return MPRemoteCommandHandlerStatusSuccess;
      }];
    }
    if(self.nextExist){
      [commandCenter.nextTrackCommand addTargetWithHandler:^MPRemoteCommandHandlerStatus(MPRemoteCommandEvent * _Nonnull event) {
        //下一首
        [self sendEventWithName:@"musicClick" body:@"next"];
        return MPRemoteCommandHandlerStatusSuccess;
      }];
    }
    
  });
}

/*
 开始播放音乐
 */
RCT_EXPORT_METHOD(
  startMusic)
{
  [self.musicPlayer play];
  __weak typeof(self) weakSelf = self;
  //监听播放进度
  self.timer = [self.musicPlayer addPeriodicTimeObserverForInterval:CMTimeMake(1, 1) queue:dispatch_get_main_queue() usingBlock:^(CMTime time) {
      float currentTime = CMTimeGetSeconds(time);
      float progress = currentTime/self.model.durationTime;
      if (progress >= 1.0f) {
        //播放完成
        if(weakSelf.nextExist){ //如果下一首存在播放下一首
          [weakSelf sendEventWithName:@"musicClick" body:@"next"];
        }else{
          [weakSelf sendEventWithName:@"musicClick" body:@"playEnd"];
        }
      }else{
        NSString *val = [NSString stringWithFormat:@"%f",currentTime];
        [weakSelf sendEventWithName:@"listenerMusicTime" body:val];
        //下面是更新锁屏栏
        NSString *currentStr = [NSString stringWithFormat:@"%d",(int)round(currentTime)];
        [weakSelf.playingInfoDict setObject:currentStr forKey:MPNowPlayingInfoPropertyElapsedPlaybackTime];
        weakSelf.playingInfoCenter.nowPlayingInfo = weakSelf.playingInfoDict;
      }
  }];
}

/**
 设置锁屏界面
 */
-(void)setLockScreenInfo:(RNMusicStatusBarMusicModel *)model
{
  //设置音乐名称
  [self.playingInfoDict setObject:model.musicTitle forKey:MPMediaItemPropertyTitle];
  //设置歌手名称
  [self.playingInfoDict setObject:model.author forKey:MPMediaItemPropertyArtist];
  //设置封面图片
  NSData *data = [NSData dataWithContentsOfURL:[NSURL URLWithString:model.iconImg]];
  UIImage *image = [[UIImage alloc]initWithData:data];
  MPMediaItemArtwork *artwork = [[MPMediaItemArtwork alloc] initWithImage:image];
  [self.playingInfoDict setObject:artwork forKey:MPMediaItemPropertyArtwork];
  //设置歌曲总时长
  [self.playingInfoDict setObject:@(model.durationTime) forKey:MPMediaItemPropertyPlaybackDuration];
  //音乐信息赋值给获取锁屏中心的nowPlayingInfo属性
  self.playingInfoCenter.nowPlayingInfo = self.playingInfoDict;
}

/*
 暂停播放音乐
 */
RCT_EXPORT_METHOD(
  pauseMusic)
{
  [self removeListenerMusic];
  [self.musicPlayer pause];
}


/*
 跳转到指定百分比播放
    time:要跳转播放的百分比
 */
RCT_EXPORT_METHOD(
  jumpTime:
    (double)time)
{
  if(time != 1.00){
    CMTime second = CMTimeMake(self.model.durationTime*time, 1);
    [self.musicPlayer seekToTime:second];
  }else{
    //-0.1、使他从0开始重新播放
    CMTime second = CMTimeMake(0, 1);
    [self.musicPlayer seekToTime:second];
  }
}

/*
 快进
 */
RCT_EXPORT_METHOD(
  advance:
    (double)time)
{
  CMTime second = CMTimeMake(CMTimeGetSeconds(self.musicPlayer.currentItem.currentTime) + time, 1);
  [self.musicPlayer seekToTime:second];
}

/*
 快退
 */
RCT_EXPORT_METHOD(
  retreat:
    (double)time)
{
  CMTime second = CMTimeMake(CMTimeGetSeconds(self.musicPlayer.currentItem.currentTime) - time, 1);
  [self.musicPlayer seekToTime:second];
}

/*
 停止播放音乐
 */
RCT_EXPORT_METHOD(
  stopMusic)
{
  [self removeListenerMusic];
  [self.musicPlayer pause];
  self.playingInfoCenter.nowPlayingInfo = nil;
}

// RN的回调事件名称列表
-(NSArray<NSString *> *)supportedEvents{
    return @[
             @"listenerMusicTime",
             @"musicClick"
             ];
}

-(void)removeListenerMusic
{
  if(self.timer){
    @try {
      [self.musicPlayer removeTimeObserver:self.timer];
      self.timer = nil;
    } @catch (NSException *exception) {
      NSLog(@"移除失败");
    }
  }
}

//对象销毁时调用
- (void)dealloc
{
  [self removeListenerMusic];
  self.musicPlayer = nil;
}





@end
