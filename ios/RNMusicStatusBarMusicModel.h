//
//  MusicModel.h
//  demo
//
//  Created by hello on 2021/5/10.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNMusicStatusBarMusicModel : NSObject


/**
 歌曲名称
 */
@property(nonatomic,copy)NSString *musicTitle;
/**
 作者
 */
@property(nonatomic,copy)NSString *author;
/**
 歌曲icon图片
 */
@property(nonatomic,copy)NSString *iconImg;
/**
 歌曲地址
 */
@property(nonatomic,copy)NSString *musicSrc;
//音频总时长
@property(nonatomic,assign)int durationTime;

-(instancetype)initWithMusicTitle:(NSString *)musicTitle andAuthor:(NSString *)author andIconImg:(NSString *)iconImg andMusicSrc:(NSString *)musicSrc;



@end

NS_ASSUME_NONNULL_END
