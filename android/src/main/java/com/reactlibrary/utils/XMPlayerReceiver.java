package com.reactlibrary.utils;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import org.json.JSONObject;

/**
 * @description:
 * @author: hello
 * @date: 2021/2/25
 */
public class XMPlayerReceiver extends BroadcastReceiver {


  @Override
  public void onReceive(Context context, Intent intent) {
    JSONObject jsonObject = new JSONObject();
    if(intent.getAction() == "changeMusicState"){
      //修改播放状态
      Inform.updateNutification(context,"start_stop_btn");
      //发送通知栏点击事件到js
//      Music.getInstance().sendJS("musicClick","pause");
    }else if(intent.getAction() == "closeMusicState"){
      //关闭音乐播放、关闭通知栏
      Inform.updateNutification(context,"close_music_btn");
    }
  }

}
