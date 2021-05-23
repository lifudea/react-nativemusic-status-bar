package com.reactlibrary.utils;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.widget.RemoteViews;


import com.reactlibrary.MusicStatusBarModule;
import com.reactlibrary.R;

import java.net.URL;

/**
 * @description:
 * @author: hello
 * @date: 2021/5/7
 */
public class Inform {

	private static RemoteViews remoteViews;
	private static NotificationManager manager;
	private static Notification notification;
	private static boolean showStart; //true显示正在播放按钮  false显示停止播放按钮

	/**
	 * @description 设置通知栏
	 * @author
	 * @time  2021/2/25
	 * @param
	 * @return
	 */
	public static void setMusicNotification(Context context, String name, String backImg){
		showStart = true;
		//getSystemService根据传入的name来取得对应的Object，然后转化成相应的服务对象
		manager = (NotificationManager) context.getSystemService(context.NOTIFICATION_SERVICE);
		//版本大于android8.0
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			String channelId = "music"; //channel的唯一标示，同一app的不同channel ，id不能重复
			String channelName = "播放音乐"; //描述信息
			int importance = NotificationManager.IMPORTANCE_MIN;   //该通知的重要程度
			NotificationChannel channel = new NotificationChannel(channelId, channelName, importance);
			manager.createNotificationChannel(channel);
		}
		notification = null;

		remoteViews = new RemoteViews(context.getPackageName(), R.layout.music_notification);
		remoteViews.setTextViewText(R.id.infrom_title_text, name);
		try {
			URL url = new URL(backImg);
			Bitmap bitmap = BitmapFactory.decodeStream(url.openStream());
			remoteViews.setImageViewBitmap(R.id.inform_back_img,bitmap);
		} catch (Exception e) {
			e.printStackTrace();
		}

		Intent prv = new Intent(context, XMPlayerReceiver.class);
		prv.setAction("changeMusicState");
		PendingIntent pendingIntent = PendingIntent.getBroadcast(context,1,prv,PendingIntent.FLAG_UPDATE_CURRENT);
		remoteViews.setOnClickPendingIntent(R.id.inform_start_icon,pendingIntent);

		Intent prv2 = new Intent(context, XMPlayerReceiver.class);
		prv2.setAction("closeMusicState");
		PendingIntent pendingIntent2 = PendingIntent.getBroadcast(context,1,prv2,PendingIntent.FLAG_UPDATE_CURRENT);
		remoteViews.setOnClickPendingIntent(R.id.inform_start_close_icon,pendingIntent2);

		if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
			notification = new Notification.Builder(context,"music") //引用加上channelid
					.setSmallIcon(R.drawable.rc_back_icon)
					.setWhen(System.currentTimeMillis())
					.setContentTitle("")
					.setContentText("??")
					.setCustomContentView(remoteViews)
					.build();
		}else{
			notification = new Notification.Builder(context)
					.setSmallIcon(R.drawable.rc_back_icon)
					.setWhen(System.currentTimeMillis())
					.setContentTitle("")
					.setContentText("")
					.setDefaults(Notification.DEFAULT_ALL)
					.build();
			notification.contentView = remoteViews;
		}
		notification.sound = null;//关了通知默认提示音

		manager.notify(1, notification);
	}

	/**
	 * @description 点击更新通知栏
	 * @author
	 * @time  2021/3/2
	 * @param desc  pause:暂停播放  stop:停止播放 start:开始播放
	 * @return
	 */
	public static void updateNutification(Context context,String desc){
		if(desc.equals("start_stop_btn")) {
			if (!!showStart) { //暂停播放音乐
				showStart = false;
				remoteViews.setImageViewResource(R.id.inform_start_icon, R.drawable.music_close_icon);
				MusicStatusBarModule.getMusicStatusBarModule().sendJS("musicClick","pause");
			} else {  //继续播放音乐
				System.out.println("点击了继续播放音乐");
				showStart = true;
				remoteViews.setImageViewResource(R.id.inform_start_icon, R.drawable.music_start_icon);
				MusicStatusBarModule.getMusicStatusBarModule().sendJS("musicClick","start");
				MusicStatusBarModule.getMusicStatusBarModule().ceshi();
			}
			notification.contentView = remoteViews;
			notification.sound = null;//关了通知默认提示音
			manager.notify(1, notification);
		}else{  //点击了关闭按钮 暂停播放音乐、关闭通知栏
			showStart = false;
			MusicStatusBarModule.getMusicStatusBarModule().sendJS("musicClick","close");
			manager.cancel(1);
		}
	}

	/**
	 * @description 暂停播放音乐、或者开始播放音乐时更新通知栏
	 * @author
	 * @time  2021/3/2
	 * @param boole true继续播放音乐  false暂停播放音乐
	 * @return
	 */
	public static void jsClickUpdateNutification(Context context,Boolean boole) {
		if (!boole) { //暂停播放音乐
			showStart = false;
			remoteViews.setImageViewResource(R.id.inform_start_icon, R.drawable.music_close_icon);
		} else {  //继续播放音乐
			showStart = true;
			remoteViews.setImageViewResource(R.id.inform_start_icon, R.drawable.music_start_icon);
		}
		notification.contentView = remoteViews;
		notification.sound = null;//关了通知默认提示音
		manager.notify(1, notification);
	}


	/**
	 * @description 停止播放音乐删除通知栏
	 * @author
	 * @time  2021/3/2
	 * @return
	 */
	public static void closeNutification(Context context) {
		manager.cancel(1);
		manager = null;
	}

}
