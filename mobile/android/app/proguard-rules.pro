# Flutter wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Dio / OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Firebase (when ENABLE_FCM=true)
-keep class com.google.firebase.** { *; }

# Flutter deferred components reference Play Core optionally (not used in this app).
-dontwarn com.google.android.play.core.**
-keep class com.google.android.play.core.** { *; }
