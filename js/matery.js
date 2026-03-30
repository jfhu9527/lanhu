$(function () {
    /**
     * 添加文章卡片hover效果.
     */
    let articleCardHover = function () {
        let animateClass = 'animated pulse';
        $('article .article').hover(function () {
            $(this).addClass(animateClass);
        }, function () {
            $(this).removeClass(animateClass);
        });
    };
    articleCardHover();

    /*菜单切换*/
    $('.sidenav').sidenav();

    /* 修复文章卡片 div 的宽度. */
    let fixPostCardWidth = function (srcId, targetId) {
        let srcDiv = $('#' + srcId);
        if (srcDiv.length === 0) {
            return;
        }

        let w = srcDiv.width();
        if (w >= 450) {
            w = w + 21;
        } else if (w >= 350 && w < 450) {
            w = w + 18;
        } else if (w >= 300 && w < 350) {
            w = w + 16;
        } else {
            w = w + 14;
        }
        $('#' + targetId).width(w);
    };

    /**
     * 修复footer部分的位置，使得在内容比较少时，footer也会在底部.
     */
    let fixFooterPosition = function () {
        $('.content').css('min-height', window.innerHeight - 165);
    };

    /**
     * 修复样式.
     */
    let fixStyles = function () {
        fixPostCardWidth('navContainer');
        fixPostCardWidth('artDetail', 'prenext-posts');
        fixFooterPosition();
    };
    fixStyles();

    /*调整屏幕宽度时重新设置文章列的宽度，修复小间距问题*/
    $(window).resize(function () {
        fixStyles();
    });

    /*初始化瀑布流布局*/
    $('#articles').masonry({
        itemSelector: '.article'
    });

    AOS.init({
        easing: 'ease-in-out-sine',
        duration: 700,
        delay: 100
    });

    /*文章内容详情的一些初始化特性*/
    let articleInit = function () {
        $('#articleContent a').attr('target', '_blank');

        $('#articleContent img').each(function () {
            let imgPath = $(this).attr('src');
            $(this).wrap('<div class="img-item" data-src="' + imgPath + '" data-sub-html=".caption"></div>');
            // 图片添加阴影
            $(this).addClass("img-shadow img-margin");
            // 图片添加字幕
            let alt = $(this).attr('alt');
            let title = $(this).attr('title');
            let captionText = "";
            // 如果alt为空，title来替
            if (alt === undefined || alt === "") {
                if (title !== undefined && title !== "") {
                    captionText = title;
                }
            } else {
                captionText = alt;
            }
            // 字幕不空，添加之
            if (captionText !== "") {
                let captionDiv = document.createElement('div');
                captionDiv.className = 'caption';
                let captionEle = document.createElement('b');
                captionEle.className = 'center-caption';
                captionEle.innerText = captionText;
                captionDiv.appendChild(captionEle);
                this.insertAdjacentElement('afterend', captionDiv)
            }
        });
        $('#articleContent, #myGallery').lightGallery({
            selector: '.img-item',
            // 启用字幕
            subHtmlSelectorRelative: true
        });

        // progress bar init
        const progressElement = window.document.querySelector('.progress-bar');
        if (progressElement) {
            new ScrollProgress((x, y) => {
                progressElement.style.width = y * 100 + '%';
            });
        }
    };
    articleInit();

    $('.modal').modal();

    /*回到顶部*/
    $('#backTop').click(function () {
        $('body,html').animate({scrollTop: 0}, 400);
        return false;
    });

    /*监听滚动条位置*/
    let $nav = $('#headNav');
    let $backTop = $('.top-scroll');
    // 当页面处于文章中部的时候刷新页面，因为此时无滚动，所以需要判断位置,给导航加上绿色。
    showOrHideNavBg($(window).scrollTop());
    $(window).scroll(function () {
        /* 回到顶部按钮根据滚动条的位置的显示和隐藏.*/
        let scroll = $(window).scrollTop();
        showOrHideNavBg(scroll);
    });

    function showOrHideNavBg(position) {
        let showPosition = 100;
        if (position < showPosition) {
            $nav.addClass('nav-transparent');
            $backTop.slideUp(300);
        } else {
            $nav.removeClass('nav-transparent');
            $backTop.slideDown(300);
        }
    }

    $(".nav-menu>li").hover(function(){
        $(this).children('ul').stop(true,true).show();
         $(this).addClass('nav-show').siblings('li').removeClass('nav-show');
        
    },function(){
        $(this).children('ul').stop(true,true).hide();
        $('.nav-item.nav-show').removeClass('nav-show');
    })
    
    $('.m-nav-item>a').on('click',function(){
            if ($(this).next('ul').css('display') == "none") {
                $('.m-nav-item').children('ul').slideUp(300);
                $(this).next('ul').slideDown(100);
                $(this).parent('li').addClass('m-nav-show').siblings('li').removeClass('m-nav-show');
            }else{
                $(this).next('ul').slideUp(100);
                $('.m-nav-item.m-nav-show').removeClass('m-nav-show');
            }
    });

    // 初始化加载 tooltipped.
    $('.tooltipped').tooltip();

    // ==================== 樱花特效联动逻辑（新增）====================

    /**
     * 获取樱花特效配置
     * 优先从 window.themeConfig 读取，若不存在则使用默认配置
     * 默认配置：总开关关闭，触发模式为加密文章，排除列表为空
     */
    function getSakuraConfig() {
        // 如果已经在 window.themeConfig 中定义了 sakura 配置，直接使用
        if (window.themeConfig && window.themeConfig.sakura) {
            return window.themeConfig.sakura;
        }
        // 否则返回默认配置（可根据需要调整）
        return {
            enable: false,
            trigger: 'encrypt',
            exclude: [],
            encryptSelector: '#encrypt-post'   // 默认使用隐藏标记
        };
    }

    // 在 PJAX 完成时检查并控制樱花特效
    $(document).on('pjax:complete', function() {
        // 检查樱花特效模块是否已加载
        if (typeof window.SakuraEffect === 'undefined') {
            // 模块未加载，不做任何操作（可选择性打印警告）
            return;
        }

        var config = getSakuraConfig();

        // 如果总开关未开启，强制停止特效并返回
        if (!config.enable) {
            SakuraEffect.stop();
            return;
        }

        // 判断当前页面是否需要开启特效
        var shouldEnable = false;
        var currentPath = window.location.pathname;

        // 检查是否在排除列表里
        if (config.exclude && config.exclude.includes(currentPath)) {
            shouldEnable = false;
        } else {
            // 根据触发模式判断
            if (config.trigger === 'all') {
                // 所有页面都触发（通常用于测试）
                shouldEnable = true;
            } else if (config.trigger === 'encrypt') {
                // 使用配置的选择器检测加密文章（默认 #encrypt-post）
                var selectors = config.encryptSelector || '#encrypt-post';
                shouldEnable = $(selectors).length > 0;
            }
        }

        // 执行开关操作
        if (shouldEnable) {
            SakuraEffect.start();
        } else {
            SakuraEffect.stop();
        }
    });

    // 页面首次加载时也触发一次检查
    $(document).ready(function() {
        // 延迟一小段时间，确保页面完全加载（尤其是樱花模块的图片）
        setTimeout(function() {
            $(document).trigger('pjax:complete');
        }, 300);
    });

    // ==================== 樱花特效联动逻辑结束 ====================
});

//黑夜模式提醒开启功能
setTimeout(function () {
    if ((new Date().getHours() >= 19 || new Date().getHours() < 7) && !$('body').hasClass('DarkMode')) {
        let toastHTML = '<span style="color:#97b8b2;border-radius: 10px;>' + '<i class="fa fa-bellaria-hidden="true"></i>晚上使用深色模式阅读更好哦。(ﾟ▽ﾟ)</span>'
        M.toast({ html: toastHTML })
    }
}, 2200);

//黑夜模式判断
if (localStorage.getItem('isDark') === '1') {
    document.body.classList.add('DarkMode');
    $('#sum-moon-icon').addClass("fa-sun").removeClass('fa-moon')
} else {
    document.body.classList.remove('DarkMode');
    $('#sum-moon-icon').removeClass("fa-sun").addClass('fa-moon')
}