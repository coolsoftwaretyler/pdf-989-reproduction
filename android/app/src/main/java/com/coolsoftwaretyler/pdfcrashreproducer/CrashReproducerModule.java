package com.coolsoftwaretyler.pdfcrashreproducer;

import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

/**
 * Utility module to copy bundled PDF assets to a path react-native-pdf can read.
 */
public class CrashReproducerModule extends ReactContextBaseJavaModule {

    CrashReproducerModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "CrashReproducerModule";
    }

    @ReactMethod
    public void getAssetPdfPath(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            File cacheFile = new File(context.getCacheDir(), "sample.pdf");
            if (!cacheFile.exists()) {
                InputStream is = context.getAssets().open("sample.pdf");
                FileOutputStream fos = new FileOutputStream(cacheFile);
                byte[] buffer = new byte[4096];
                int len;
                while ((len = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, len);
                }
                fos.close();
                is.close();
            }
            promise.resolve(cacheFile.getAbsolutePath());
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage(), e);
        }
    }
}
