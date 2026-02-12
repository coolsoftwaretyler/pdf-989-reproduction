package com.coolsoftwaretyler.pdfcrashreproducer;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import io.legere.pdfiumandroid.util.Config;
import io.legere.pdfiumandroid.util.ConfigKt;
import io.legere.pdfiumandroid.util.AlreadyClosedBehavior;

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
    public void triggerDoubleClose(Promise promise) {
        try {
            // Read the current global config to show what behavior is configured
            AlreadyClosedBehavior behavior = ConfigKt.getPdfiumConfig().getAlreadyClosedBehavior();

            // This is the EXACT code path that PdfPage.close() and PdfDocument.close()
            // call when they detect an already-closed resource. Passing `true` means
            // "yes, this resource is already closed."
            //
            // With AlreadyClosedBehavior.EXCEPTION (default): throws IllegalStateException
            // With AlreadyClosedBehavior.IGNORE (our fix): logs and returns true
            ConfigKt.handleAlreadyClosed(true);

            // If we get here, the double-close was handled gracefully
            promise.resolve("SUCCESS: Double-close silently ignored (behavior=" + behavior + ")");
        } catch (IllegalStateException e) {
            // This is the exact crash from issue #989
            AlreadyClosedBehavior behavior = ConfigKt.getPdfiumConfig().getAlreadyClosedBehavior();
            promise.resolve("CRASH: " + e.getClass().getSimpleName() + ": " + e.getMessage()
                + " (behavior=" + behavior + ")");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage(), e);
        }
    }
}
