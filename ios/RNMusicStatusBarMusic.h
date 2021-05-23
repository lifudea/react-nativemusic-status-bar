//
//  Music.h
//  demo
//
//  Created by hello on 2021/5/10.
//
#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import "React/RCTBridgeModule.h"
#endif


#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <React/RCTEventEmitter.h>
#import <MediaPlayer/MediaPlayer.h>
#import "RNMusicStatusBarMusicModel.h"

NS_ASSUME_NONNULL_BEGIN

@interface RNMusicStatusBarMusic : RCTEventEmitter<RCTBridgeModule,AVAudioPlayerDelegate>

@end

NS_ASSUME_NONNULL_END
