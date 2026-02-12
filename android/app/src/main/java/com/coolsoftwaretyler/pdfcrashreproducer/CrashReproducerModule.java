package com.coolsoftwaretyler.pdfcrashreproducer;

import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import io.legere.pdfiumandroid.util.ConfigKt;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

/**
 * Native module that deterministically reproduces the "Already closed" crash
 * from react-native-pdf issue #989.
 *
 * When a PDF page or document is double-closed (the race condition scenario),
 * pdfiumandroid calls ConfigKt.handleAlreadyClosed(true). With the default
 * config (EXCEPTION), this throws IllegalStateException. With IGNORE, it
 * silently returns.
 *
 * This module calls that exact code path to demonstrate the crash and fix.
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

    @ReactMethod
    public void triggerDoubleClose(Promise promise) {
        // Run on a background thread — just like the real crash, which happens on
        // RenderingHandler's HandlerThread when it tries to close an already-closed page.
        new Thread(() -> {
            // This is the EXACT code path that PdfPage.close() and PdfDocument.close()
            // call when they detect an already-closed resource.
            //
            // With AlreadyClosedBehavior.EXCEPTION (default): throws uncaught
            // IllegalStateException on this thread → app force-closes.
            // With AlreadyClosedBehavior.IGNORE (our fix): silently returns.
            ConfigKt.handleAlreadyClosed(true);

            // If we get here, the fix is working — double-close was ignored
            promise.resolve("ok");
        }).start();
    }
}
