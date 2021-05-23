
package com.reactlibrary;

import android.app.Activity;
import android.content.Context;
import android.media.MediaPlayer;
import android.net.Uri;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.reactlibrary.utils.Inform;

import java.sql.Time;
import java.util.Timer;
import java.util.TimerTask;

/**
 * @description 音频播放状态栏
 * @author 
 * @time  2021/5/7
 * @param 
 * @return 
 */
public class MusicStatusBarModule extends ReactContextBaseJavaModule {

    //音频对象
    private MediaPlayer mediaPlayer;
    //音频播放总时长
    private int duration;
    private TimerTask timerTask;
    //计时器
    private Timer timer;
    private Activity currentActivity;
    private Context applicationContext;
    //Context对象
    private final ReactApplicationContext reactContext;

    static MusicStatusBarModule musicStatusBarModule;

    public MusicStatusBarModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        musicStatusBarModule = this;
    }
    public static MusicStatusBarModule getMusicStatusBarModule(){
        return musicStatusBarModule;
    }

    @Override
    public String getName() {
        return "Music";
    }

    /**
    * @description 创建音频对象
    * @author
    * @time  2021/5/7
    * @param musicTitle  歌曲名称
    * @param author  作者
    * @param iconImg 歌曲icon图片
    * @param musicSrc  歌曲地址
    * @return
    */
    @ReactMethod
    public void createMusic(String musicTitle,String author,String iconImg,String musicSrc,Promise promise){
        currentActivity = getCurrentActivity();
        applicationContext = currentActivity.getApplicationContext();
        //设置音频通知栏
        Inform.setMusicNotification(applicationContext,musicTitle,iconImg);
        if(mediaPlayer == null){
            //创建音频对象
            mediaPlayer = MediaPlayer.create(applicationContext, Uri.parse(musicSrc));
            duration = mediaPlayer.getDuration();
            promise.resolve(duration/1000);
        }else{
            mediaPlayer.stop();
            mediaPlayer = null;
            mediaPlayer = MediaPlayer.create(applicationContext,Uri.parse(musicSrc));
            duration = mediaPlayer.getDuration();
            promise.resolve(duration/1000);
        }
        mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener(){
            @Override
            public void onCompletion(MediaPlayer mp) {
                stopMusic();
                sendJS("musicClick","playEnd");
            }
        });
    }


    
    @ReactMethod
    /**
     * @description 开始播放音乐
     * @author 
     * @time  2021/5/7
     * @param 
     * @return void
     */
    private void startMusic(){
        mediaPlayer.start();
        Inform.jsClickUpdateNutification(applicationContext,true);
        if(timerTask == null){
            timerTask = new TimerTask() {
                @Override
                public void run() {
                    int currentPosition = mediaPlayer.getCurrentPosition();
                    //发送当前播放进度到RN端
                    sendJS("listenerMusicTime",currentPosition/1000);
                }
            };
            timer = new Timer();
            timer.schedule(timerTask,0,1000);
        }
    }

    @ReactMethod
    /**
     * @description 暂停播放音乐
     * @author
     * @time  2021/5/7
     * @param
     * @return
     */
    public void pauseMusic(){
        mediaPlayer.pause();
        Inform.jsClickUpdateNutification(applicationContext,false);
        clearTimer();
    }



    /**
     * @description 停止播放音乐
     * @author
     * @time  2021/5/7
     * @param
     * @return
     */
    public void stopMusic(){
        if(mediaPlayer != null){
            mediaPlayer.stop();
            mediaPlayer.release();
            mediaPlayer = null;
            Inform.closeNutification(applicationContext);
            clearTimer();
        }
    }

    public void ceshi(){
//        try {
//            new Thread.sleep(1000);
//            System.out.println("点击了继续播放音乐");
//        }catch (Exception e){
//            System.out.println(e);
//            System.out.println("点击了继续播放音乐错误");
//        }
        Thread thread = new Thread();
        thread.setName("线程Process");
        thread.start();
        for (int i = 0; i < 10; i++) {
            try {
                //阻塞main线程，休眠一秒钟
                Thread.sleep(1000);
                System.out.println("点击了继续播放音乐睡眠了");
            }catch (Exception e){
                System.out.println("点击了继续播放音乐e===" + e);
            }
        }
    }

    /**
     * @description 跳转到指定百分比播放
     * @author
     * @time  2021/3/1
     * @param
     * @return
     */
    @ReactMethod
    public void jumpTime(float percent){
        int time = Math.round(duration * percent);
        mediaPlayer.seekTo(time);
        startMusic();
    }

    /**
     * @description 快退
     * @author
     * @time  2021/3/1
     * @param num 快退时长  秒
     * @return
     */
    @ReactMethod
    public void  retreat(int num){
        if(mediaPlayer != null) {
            int time = mediaPlayer.getCurrentPosition() - num * 1000;
            mediaPlayer.seekTo(time);
            startMusic();
        }
    }

    /**
     * @description 快进
     * @author
     * @time  2021/3/1
     * @param num 快进时长  单位秒
     * @return
     */
    @ReactMethod
    public void  advance(int num){
        if(mediaPlayer != null) {
            int time = mediaPlayer.getCurrentPosition() + num * 1000;
            mediaPlayer.seekTo(time);
            startMusic();
        }
    }

    /**
     * @description 关闭计时器
     * @author 
     * @time  2021/5/7
     * @param 
     * @return 
     */
    public void clearTimer(){
        timer.cancel();
        timer = null;
        timerTask.cancel();
        timerTask = null;
    }

    /**
    * @description 发送消息到js
    * @author
    * @time  2021/1/21
    * @param eventName   事件名称
    * @param string  发送到参数
    * @return
    */
    public void sendJS(String eventName,String string) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, string);
    }
    public void sendJS(String eventName,int num) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, num);
    }
}