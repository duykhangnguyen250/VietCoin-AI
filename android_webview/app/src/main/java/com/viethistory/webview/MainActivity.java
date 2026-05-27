package com.viethistory.webview;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.view.Menu;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;

import com.google.android.material.navigation.NavigationView;

public class MainActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {

    private WebView webView;
    private ProgressBar progressBar;
    private DrawerLayout drawerLayout;
    private NavigationView navigationView;
    private TextView navUserName, navUserStatus;
    private ImageView navUserAvatar;
    private View navHeaderContainer;
    private String siteLogoUrl = "";
    private String siteBgUrl = "";
    private String userPictureUrl = "";
    private ValueCallback<Uri[]> filePathCallback;
    private final static int FILE_CHOOSER_RESULT_CODE = 1;
    
    private final String WEB_URL = "http://10.0.2.2:5173";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Thiết lập Toolbar
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayShowTitleEnabled(false);
        }

        drawerLayout = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);

        // Header views for dynamic updates
        View headerView = navigationView.getHeaderView(0);
        navUserName = headerView.findViewById(R.id.nav_user_name);
        navUserStatus = headerView.findViewById(R.id.nav_user_status);
        navUserAvatar = headerView.findViewById(R.id.nav_user_avatar);
        navHeaderContainer = headerView.findViewById(R.id.nav_header_container);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(this, drawerLayout, toolbar,
                R.string.app_name, R.string.app_name);
        drawerLayout.addDrawerListener(toggle);
        toggle.syncState();
        toggle.getDrawerArrowDrawable().setColor(getResources().getColor(android.R.color.white));

        // Thanh trạng thái màu đen sang trọng
        setStatusBarColor();

        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);

        initWebView();
        loadWeb();
    }

    private void setStatusBarColor() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(android.graphics.Color.BLACK);
        }
    }

    private void initWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setSupportMultipleWindows(true); // Support for popups

        // Bypass Google Login block: "403: disallowed_useragent"
        // We use a specific Chrome for Android User-Agent that Google is known to accept in WebViews
        String chromeUA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36";
        webSettings.setUserAgentString(chromeUA);

        // Native bridge
        webView.addJavascriptInterface(new WebAppInterface(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://localhost:")) {
                    String newUrl = url.replace("http://localhost:", "http://10.0.2.2:");
                    view.loadUrl(newUrl);
                    return true;
                }
                return super.shouldOverrideUrlLoading(view, request);
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("http://localhost:")) {
                    String newUrl = url.replace("http://localhost:", "http://10.0.2.2:");
                    view.loadUrl(newUrl);
                    return true;
                }
                return super.shouldOverrideUrlLoading(view, url);
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                if (url.startsWith("http://localhost:")) {
                    String newUrl = url.replace("http://localhost:", "http://10.0.2.2:");
                    view.stopLoading();
                    view.loadUrl(newUrl);
                    return;
                }
                super.onPageStarted(view, url, favicon);
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    String url = request.getUrl().toString();
                    if (!url.startsWith("http://localhost:")) {
                        Toast.makeText(MainActivity.this, "Lỗi kết nối server", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress == 100) {
                    progressBar.setVisibility(View.GONE);
                } else {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("image/*");
                startActivityForResult(Intent.createChooser(intent, "Chọn hình ảnh"), FILE_CHOOSER_RESULT_CODE);
                return true;
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (filePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                String dataString = data.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }

    private void loadWeb() {
        if (isNetworkAvailable()) {
            webView.loadUrl(WEB_URL);
        } else {
            Toast.makeText(this, "Không có kết nối mạng!", Toast.LENGTH_LONG).show();
        }
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager connectivityManager = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }

    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.nav_home) {
            runJS("switchView('coin')");
        } else if (id == R.id.nav_history) {
            runJS("switchView('profile')"); // Profile contains history in this app
        } else if (id == R.id.nav_payment) {
            runJS("switchView('payment')");
        } else if (id == R.id.nav_profile) {
            runJS("switchView('profile')");
        } else if (id == R.id.nav_admin) {
            runJS("switchView('admin')");
        } else if (id == R.id.nav_logout) {
            performLogout();
        }
        drawerLayout.closeDrawer(GravityCompat.START);
        return true;
    }

    private void runJS(String script) {
        webView.evaluateJavascript("if(window.switchView) { " + script + "; }", null);
    }

    private void performLogout() {
        CookieManager.getInstance().removeAllCookies(null);
        CookieManager.getInstance().flush();
        webView.evaluateJavascript(
            "if (window.handleLogoutMobile) { window.handleLogoutMobile(); } else { localStorage.clear(); sessionStorage.clear(); location.reload(); }",
            null
        );
        Toast.makeText(this, "Đã đăng xuất thành công", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START);
        } else if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private void updateHeaderViews() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Context context = MainActivity.this;
                
                // 1. Load Background
                if (siteBgUrl != null && !siteBgUrl.isEmpty()) {
                    String finalBgUrl = siteBgUrl.replace("localhost", "10.0.2.2");
                    com.bumptech.glide.Glide.with(context)
                        .load(finalBgUrl)
                        .centerCrop()
                        .into(new com.bumptech.glide.request.target.CustomViewTarget<View, android.graphics.drawable.Drawable>(navHeaderContainer) {
                            @Override
                            public void onLoadFailed(@Nullable android.graphics.drawable.Drawable errorDrawable) {
                                navHeaderContainer.setBackgroundColor(android.graphics.Color.parseColor("#121212"));
                            }

                            @Override
                            public void onResourceReady(@NonNull android.graphics.drawable.Drawable resource, @Nullable com.bumptech.glide.request.transition.Transition<? super android.graphics.drawable.Drawable> transition) {
                                navHeaderContainer.setBackground(resource);
                            }

                            @Override
                            protected void onResourceCleared(@Nullable android.graphics.drawable.Drawable placeholder) {
                                navHeaderContainer.setBackground(placeholder);
                            }
                        });
                } else {
                    navHeaderContainer.setBackgroundColor(android.graphics.Color.parseColor("#121212"));
                }

                // 2. Load Avatar or App Logo
                String avatarUrl = "";
                if (userPictureUrl != null && !userPictureUrl.isEmpty()) {
                    avatarUrl = userPictureUrl;
                } else if (siteLogoUrl != null && !siteLogoUrl.isEmpty()) {
                    avatarUrl = siteLogoUrl;
                }

                if (!avatarUrl.isEmpty()) {
                    String finalAvatarUrl = avatarUrl.replace("localhost", "10.0.2.2");
                    com.bumptech.glide.Glide.with(context)
                        .load(finalAvatarUrl)
                        .circleCrop()
                        .placeholder(android.R.drawable.btn_star_big_on)
                        .error(android.R.drawable.btn_star_big_on)
                        .into(navUserAvatar);
                } else {
                    navUserAvatar.setImageResource(android.R.drawable.btn_star_big_on);
                }
            }
        });
    }

    // NATIVE BRIDGE CLASS
    public class WebAppInterface {
        @JavascriptInterface
        public void setSiteConfig(final String logoUrl, final String backgroundUrl) {
            siteLogoUrl = logoUrl;
            siteBgUrl = backgroundUrl;
            updateHeaderViews();
        }

        @JavascriptInterface
        public void setLoginState(final boolean isLoggedIn, final String fullName, final String balance, final boolean isAdmin, final String pictureUrl) {
            userPictureUrl = pictureUrl;
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Menu menu = navigationView.getMenu();
                    menu.findItem(R.id.nav_history).setVisible(isLoggedIn);
                    menu.findItem(R.id.nav_payment).setVisible(isLoggedIn);
                    menu.findItem(R.id.nav_profile).setVisible(isLoggedIn);
                    menu.findItem(R.id.nav_admin).setVisible(isLoggedIn && isAdmin);
                    menu.findItem(R.id.nav_logout).setVisible(isLoggedIn);

                    if (isLoggedIn) {
                        navUserName.setText(fullName);
                        navUserStatus.setText(balance + " Tokens");
                    } else {
                        navUserName.setText("VIETCOIN AI");
                        navUserStatus.setText("Giám định tiền cổ Việt Nam");
                    }
                }
            });
            updateHeaderViews();
        }
    }
}
