

//
//  MusicModel.m
//  demo
//
//  Created by hello on 2021/5/10.
//

#import "RNMusicStatusBarMusicModel.h"

@implementation RNMusicStatusBarMusicModel

-(instancetype)initWithMusicTitle:(NSString *)musicTitle andAuthor:(NSString *)author andIconImg:(NSString *)iconImg andMusicSrc:(NSString *)musicSrc
{
  self.musicTitle = musicTitle;
  self.author = author;
  self.iconImg = iconImg;
  self.musicSrc = musicSrc;
  return self;
}


@end
