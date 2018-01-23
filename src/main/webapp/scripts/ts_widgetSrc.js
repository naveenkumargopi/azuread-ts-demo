'use strict';

var ts =(function () {
    // Variable we used in all functions
    var thj;

    // Check device is Mobile or desktop
    var isMobile = ('ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/));

    //Adding dependent files to dom
    function getDependentFile(url, isNotLoaded, success) {
        // Check if file is already exists in DOM, if loaded in DOM, call the success fuction 
        if (isNotLoaded(url)) {
            var dependentFile = getFileObj(url);
            var head = document.getElementsByTagName('head')[0], done = false;
            // Attach handlers for all browsers
            dependentFile.onload = dependentFile.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    done = true;
                    success();
                    dependentFile.onload = dependentFile.onreadystatechange = null;
                    //Remove file from DOM if the file js 
                    if (url.endsWith('.js')) {
                        head.removeChild(dependentFile);
                    }
                }
            };
            head.appendChild(dependentFile);
        } else {
            success();
        }
    }

    function getFileObj(url) {

        if (url.endsWith('.js')) {
            return getScript(url);
        } else {
            return getCss(url);
        }
    }

    function getScript(url) {
        var script = document.createElement('script');
        script.src = url;
        script.setAttribute('async', '');
        script.onerror = function (evt) {
            console.log("Script Error", evt);
        };
        return script;
    }

    function getCss(url) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        link.onerror = function (evt) {
            console.log("LINK Error", evt);
        };
        return link;
    }
    // CHecking if jQuery already in DOM
    var jQueryCheck = function () {
        return (typeof jQuery === 'undefined')
    }
    // Checking if axios already in DOM
    var axiosCheck = function () {
        return typeof axios === 'undefined';
    }
    // Checking if intlTelInput plugin already in DOM
    var intlTelInputCheck = function () {
        if(isMobile) {
            return false;
        } else {
            return typeof jQuery().intlTelInput === 'undefined';
        }
    }
    // This is a dummy function to make compatible other file download call
    var checkStyleSheetExists = function (url) {
        if(isMobile) {
            return false;
        } else {
            return true;
        }
    }
    getDependentFile('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js', jQueryCheck, function () {
        getDependentFile('https://cdnjs.cloudflare.com/ajax/libs/axios/0.15.3/axios.min.js', axiosCheck, function () {
            main();
        });
    });

    function setDefaultMethod() {
        if(isMobile) {
            curAuthenticationMethod = deeplinkStr;
        } else {
            curAuthenticationMethod = qrCodeStr;
        }
    }

    // Definig Text values for both authentication methods(QR-Code and Deeplinking), also for
    // Login and Register action
    var widgetTexts = {};
    var curAuthenticationMethod;
    var curAuthenticationAction;
    var qrCodeStr = 'qrcode';
    var deeplinkStr = 'deeplink';
    var registerStr = 'register';
    var loginStr = 'login';
    var deeplinkTitle = 'Open in Thumbsignin app';

    var ALREADY_REGISTERED = 

    widgetTexts[qrCodeStr] = {
                                refreshTXT : 'Click to Generate Another QR Code.',
                                tsInitiated : 'QR Code Scanned.',
                                changeMethodText: 'Have app on this phone?',
                                changeMethodLinkTitle: 'Open app'  
                            };
    widgetTexts[deeplinkStr] = {
                                refreshTXT : 'Click on refresh icon and try again.',
                                tsInitiated : 'User verification initiated.',
                                changeMethodText: 'Have app on a different phone?',
                                changeMethodLinkTitle: 'Show QR Code'
                            }; 
    widgetTexts[loginStr] =  {
                                    title : 'LOG IN USING FINGERPRINT',
                                    successMsg : 'You have successfully logged in using your fingerprint',           
                                };

    widgetTexts[loginStr][qrCodeStr]={
                                        introMsg : 'Scan the QR code above using the ThumbSignIn app on your phone.'
                                    }
    widgetTexts[loginStr][deeplinkStr]={
                                        introMsg : ''
                                    }
    widgetTexts[registerStr] =  {
                                    title : 'ENABLE FINGERPRINT LOGIN',
                                    successMsg : 'Fingerprint Login Enabled Successfully'
                                };
    widgetTexts[registerStr][qrCodeStr]={
                                    introMsg : 'Scan the QR code above using the ThumbSignIn app on your phone to enable fingerprint authentication.'
                                }
    widgetTexts[registerStr][deeplinkStr]={
                                    introMsg : ''
                                }
    // This is where we set up widget and wait for user to click on a link and display widget
    function main() {
        // Assigning jQUery object to thj
        var thj = $;
        var successMsg;
        
        // Indicate whether we need to refresh widget to get new Transaction
        var isRefreshNeeded;

        // We are setting method based on value of isMobile
        setDefaultMethod();

        // Define all style of widget
        var styles = "a#change_method_link{padding-left:2px;}p#intro_msg{margin-bottom: 30px;} .hidden{dispaly:none!important}.country-list{z-index:10001 !important} #tsModal,.open-app{font-family:Roboto}.open-app{width:250px;height:40px;border-radius:5px;background-color:#48d2a0;background-image:url(https://thumbsignin.com/styles/img/icons-8-open-in-popup.png);background-repeat:no-repeat;background-position:10px;margin:0 auto}.open-app a{font-size:16px;color:#fff;text-align:left;line-height:40px;padding-left:25px}#qrcode,.fs18,.intro-msg,.item h1,.ts_initiated,.tsmodal-footer,.tsmodal-header{text-align:center}.country-list{max-width:248px}#sms_result{display:none;color:#8b4513}.intl-tel-input{border-left:1px solid #ccc; height: 37px;}.d-box{width:100%;height:50px}.d-box .db-a,.d-box .db-b{float:left;position:relative}.db-a button,.db-a ul{border:1px solid #ccc}.d-box .db-a{width:50px}.db-a .d-arrow{position:relative;left:4px}.d-box .db-b{width:240px}.db-a button{display:inline-block;background:#FFF;width:100%;height:36px}.db-a ul{border-top:none;position:absolute;left:0;top:36px;right:0;background:#fff;max-height:250px;overflow-y:auto;width:235px;list-style:none;padding:0;display:none}.closeIcon,.logoIcon,.refreshImg{background-repeat:no-repeat}.db-a ul li{padding:7px;border-bottom:1px solid #f0f0f0}.db-a ul li img{max-width:none}.db-a ul li span{font-size:14px;position:relative;color:#999;font-weight:400;margin:0 0 0 5px}.db-a ul li:hover{background-color:#fafafa;cursor:pointer}.db-b input{border:1px solid #ccc;height:36px;border-left:none;max-width:100%;background-color: white;width: auto !important;}.db-b img.d-arrow-b{position:absolute;right:26px;top:10px;cursor:pointer}.ts_initiated{opacity:1;position:absolute;top:110px;width:88%;font-size:20px}.refreshTxt,.ts-sucess{text-align:center;color:#646464;position:absolute;top:160px;font-size:11px;width:90%}.refreshTxt,.tsmodal{width:100%}.ts-sucess{top:175px;margin-left:15px}.tsmodal{position:fixed;z-index:1000;padding-top:100px;left:0;top:0;height:100%;overflow:auto;background-color:#000;background-color:rgba(0,0,0,.4)}.item,.tsmodal-body,.tsmodal-content{position:relative}.closeIcon,.overlay{cursor:pointer;position:absolute}.closeIcon{height:16px;width:16px;right:-23px;top:-15px;background-image:url(https://thumbsignin.com/styles/img/del-white.png)}.tsmodal-content{background-color:#fefefe;margin:auto;padding:0;border:1px solid #888;width:270px;box-shadow:0 4px 8px 0 rgba(0,0,0,.2),0 6px 20px 0 rgba(0,0,0,.19);-webkit-animation-name:animatetop;-webkit-animation-duration:.4s;animation-name:animatetop;animation-duration:.4s}@-webkit-keyframes animatetop{from{top:-300px;opacity:0}to{top:0;opacity:1}}@keyframes animatetop{from{top:-300px;opacity:0}to{top:0;opacity:1}}.fs18{font-size:16px;margin:15px 0;font-weight:500;color:#fff}.tsmodal-footer{padding:2px 16px 15px;color:#4a4a4a;background-color:#f0f0f0}.tsmodal-footer p{font-size:12px;margin:10px auto}.tsmodal-footer span{cursor:pointer;font-weight:700;color:#38adaa}.tsmodal-header{padding:2px 16px;color:#fff;background-image:linear-gradient(72deg,#48d2a0,#288bb3);font-size:18px;text-transform:uppercase}.tsmodal-body{padding:2px 16px;height:180px}.overlay,.refreshImg{height:100%;width:100%}.overlay{margin:0 auto;z-index:1;background-color:rgba(255,255,255,.9)}.refreshImg{background-image:url(https://thumbsignin.com/styles/img/icons-8-refresh.png);background-size:auto;margin:auto;background-position-x:50%;background-position-y:50%}.more-info2{max-width:150px!important}.logoIcon{background-size:contain;background-image:url(https://thumbsignin.com/styles/img/qr-code.png);position:absolute;width:30px;z-index:0;height:30px;top:44%;left:44%}.intro-msg{color:#4a4a4a;font-size:13px;font-weight:600;padding:0 30px;margin-top:75px}#qrcode{/*margin-top:10px*/}#qrcode img{margin:30px auto 17px;height:200px}.open-app-icon{height:auto!important;margin:50px auto!important}.item h1{position:absolute;width:100%;color:#434A54;font-size:15px}.circle_animation{stroke-dasharray:440;stroke-dashoffset:440;transition:all 1s linear}.circle-loader{margin:40px 0 30px -15px;border:2px solid rgba(0,0,0,.2);border-left-color:#5cb85c;animation-name:loader-spin;animation-duration:1s;animation-iteration-count:infinite;animation-timing-function:linear;position:relative;left:35%;display:inline-block;vertical-align:top}.circle-loader,.circle-loader:after{border-radius:50%;width:8em;height:8em}.load-complete{-webkit-animation:none;animation:none;border-color:#5cb85c;transition:border .5s ease-out}.checkmark{display:none}.checkmark.draw:after{animation-duration:.8s;animation-timing-function:ease;animation-name:checkmark;transform:scaleX(-1) rotate(135deg)}.checkmark:after{opacity:1;height:4em;width:2em;transform-origin:left top;border-right:2px solid #5cb85c;border-top:2px solid #5cb85c;content:'';left:2em;top:4em;position:absolute}@media screen and (max-width:720px){.ts_initiated{width:95%;} .more-info{margin:0 auto;max-width:248px}.closeIcon{right:5px;top:16px}.tsmodal{padding-top:0}.tsmodal-content{width:100%;height:100%}}@keyframes loader-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes checkmark{0%{height:0;width:0;opacity:1}20%{height:0;width:2em;opacity:1}100%,40%{height:4em;width:2em;opacity:1}}";
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('style');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        if (link.styleSheet) link.styleSheet.cssText = styles; else link.appendChild(document.createTextNode(styles));
        head.appendChild(link);
        var transId;
        // Definig HTML of the widget
        var modalContent = '<div id="tsModal" class="tsmodal"> ' +
            '<div class="tsmodal-content">' +
            '<div class="tsmodal-header">' +
            '<span class="closeIcon"></span>' +
            '<h2 class="fs18"></h2>' +
            '</div>' + '<div class="tsmodal-body"> ' +
            '<p class="ts_initiated" id="tsInitiated">' +''+ '</p>' +
            '<div class="item html" >' +
            '<div class="ts-timeout overlay"><div class="refreshImg"/><div class="refreshTxt" id="refreshTXT">' + '' + '</div></div>' +
            '<p class="ts-sucess"></p>' +
            '<div id="qrcode"></div>' +
            '<div class="circle-loader load-complete">' +
            '<div class="checkmark draw"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="intro-msg"><p id="intro_msg"></p>';
        // Specific HTML contents to Mobile
        if (isMobile) {
            modalContent += '<p>'+
            '<span id="change_method">'+''+'</span>'+
            '<a ';
            if('safari' === getBrowser()) {
                modalContent += 'target="_blank" ';
            }
            modalContent += 'id="change_method_link">'+''+'</a>'+
            '</p>';
        }
        modalContent+='</div>';
        // Specific HTML contents to Destop
        if (false === isMobile) {
            modalContent += '<div class="tsmodal-footer"><p>Don’t have the app yet?<span id="get_link_by_sms" style="display:none;"> Get it now</span></p><div class="more-info" style="cursor:pointer;display:flex;"><img src="https://thumbsignin.com/styles/img/icon.png" height="30px" width="30px" style=""/><a target="_blank" href="https://itunes.apple.com/in/app/thumbsignin/id1279260047"><img src="https://thumbsignin.com/styles/img/appstore.png" height="30px" width="110px" style="padding-left:10px;"/></a><a target="_blank" href="https://play.google.com/store/apps/details?id=com.pramati.thumbsignin.app"><img src="https://thumbsignin.com/styles/img/playstore.png" height="30px" width="110px" style="padding-left:10px;padding-right:10px"/></a></div><p class="more-info more-info2" >Send me an SMS with a link to install the app</p><div class="more-info"><div class="d-box"><p id="sms_result" class="more-info"></p><div class="db-b"><input type="text" placeholder="123 456 7890" id="phone" maxlength="10"><img class="d-arrow-b" src="https://thumbsignin.com/styles/img/icons-8-sent-filled.png"></div></div></div></div>';
        }
        modalContent += '</div>' +
            '</div>';
        var modal = thj(modalContent);
        modal.hide();
        modal.appendTo(document.body);

        var timerHandle, actionUrl, statusUrl, signInUrl;

        // Bind event handler to open widget
        thj(document).on("click", ".ts-auth-button", function () {
            actionUrl = thj(this).data("action-url");
            statusUrl = thj(this).data("status-url");
            // Calling method again to make default action as deeplinking when user open widget
            // after closing widget modal
            setDefaultMethod();
            openWidgetModal();
            createTransaction();

        });



        // This function is responsible for displaying widget modal with appropriate text with 
        // loader image
        function openWidgetModal() {

            modal.find('.more-info').hide();
            // Finidng action(either login or register) based on action url
            // This also will consider for displaying text on widget
            if((-1 != actionUrl.indexOf("tsAuth/authenticate"))) {
                curAuthenticationAction = loginStr;
            } else {
                curAuthenticationAction = registerStr;
            }

            var title = getWidgetTitle();
            successMsg = getWidgetSuccessmessage();

            modal.find('.fs18').text(title);

            resetModal();
            modal.show();
            modal.find('.circle-loader').show();
        }        

        // Resetiing all texts and icons in widget 
        function resetModal() {
            
            // modal.find('.qr-time').show();
            modal.find('.ts-timeout').hide();
            modal.find('#intro_msg').text(getWidgetIntroMsg());
            modal.find('.intro-msg').show();
            modal.find('.checkmark').hide();
            modal.find('.ts-sucess').hide();
            modal.find("#qrcode").empty();
            modal.find('.circle-loader').removeClass('load-complete');
            modal.find('.circle-loader').css('opacity', '1');
            modal.find('.ts-timeout').hide();
            thj('#qrcode').css('opacity', '1');
            thj('.ts_initiated').hide();
            clickedOnOpenApp = false;

            if (isMobile) {
                manageChangeMethodLink('auto');
                modal.find('#change_method').text(getWidgetChangeMethodText());
                modal.find('#change_method_link').text(getWidgetChangeMethodLinkTitle());
            }
            modal.find('#refreshTXT').html(getWidgetRefreshMessage());
            modal.find('#tsInitiated').html(getWidgetInitiationMessage());
        }

        var deepLinkUrl, deeplinkingHTML, qrcodeHTML;
        var widgetUrlParameterSeparator = '----';
        var widgetUrlParameterPart = '#ThumbsignId';
        // This function will create Transaction, display Deeplink or QR code in the widget modal
        // Getting Transaction ID and start checking Transaction status only if method is QRCode.
        function createTransaction(callbackFn) {
            
            modal.find('.intro-msg').hide();
            
            axios.get(actionUrl).then(function (response) {
                // isRefreshNeeded will be true only if the transaction status is failure
                isRefreshNeeded = false;
                var res = response.data;
                
                var time = 0;
                var i = res.expireInSeconds;
                modal.find("#qrcode").show();
              
                transId = res.transactionId;

                if(res.deepLinkUrl) {
                    
                    res.deepLinkUrl += '?transactionId=' + res.transactionId + '&browser=' + getBrowser() + '&actionUrl=' + actionUrl + '&statusUrl=' + statusUrl + '&widgetUrlParameterSeparator=' + widgetUrlParameterSeparator + '&returnurl=' + getReturnURL(res.transactionId);
                    deepLinkUrl = res.deepLinkUrl; 
                    
                    // Creating HTML for both QR code and Deeplinkg
                    deeplinkingHTML = "<div id='deeplinkContainer' class='hidden'><img id='openApp' class='open-app-icon' src='https://thumbsignin.com/styles/img/group.png'/><div class='open-app'><a class='deeplink' ";
                    if('safari' === getBrowser()) {
                        deeplinkingHTML += 'target="_blank" ';
                    }
                    deeplinkingHTML +="href='" + res.deepLinkUrl + "'>" + deeplinkTitle + "</a></div></div>";
                    modal.find('#change_method_link').attr("href", res.deepLinkUrl);
                } else {
                    deepLinkUrl = undefined;
                }   
                
                qrcodeHTML = "<div class='logoIcon'/><img src=\"data:image/png;base64," + res.qrImage + "\"/>";

                if (deeplinkStr === curAuthenticationMethod && res.deepLinkUrl) {
                    modal.find("#qrcode").html(deeplinkingHTML);
                    // This is avoiding jump due to icon image
                    document.getElementById('openApp').onload = function () {
                        modal.find('.circle-loader').hide();
                        openApp.parentElement.className='';
                        modal.find('.intro-msg').show();
                    }                   

                } else {
                    modal.find('.circle-loader').hide();
                    modal.find("#qrcode").html(qrcodeHTML);
                    modal.find('.intro-msg').show();
                    
                    
                    // timerHandle = setInterval(function () {
                    //     if (i === time) {
                    //         modal.find('.ts-timeout').fadeIn();
                    //         clearInterval(timerHandle);
                    //         return;
                    //     }
                    //     i--;
                    // }, 1000);
                }

                checkTransaction(statusUrl + res.transactionId);

                if('undefined' != typeof callbackFn) {
                    callbackFn(res);
                }

            }).catch(function (err) {
                
                console.log('Error: ' + err);
                modal.find('.circle-loader').hide();
                if(401 == err.response.status) {
                    modal.find('#intro_msg').html('Please login and try again.').show();
                } else {
                    modal.find('#intro_msg').html('Please try again').show();
                }
                modal.find('.intro-msg').show();
                setTimeout(function () {
                    closeModal();
                    window.location.assign(window.location.origin);
                }, 2000);
            });
        }


        // User can change widget method from Deelplinking to QR code and 
        if (isMobile) {
            modal.find('#change_method_link').click(function (eventObj) {
                changeWidgetMethod(thj(this), eventObj);
            });
        }

        function getWidgetTitle() {
            return widgetTexts[curAuthenticationAction].title;
        }

        function getWidgetSuccessmessage() {
            return widgetTexts[curAuthenticationAction].successMsg;
        }

        function getWidgetIntroMsg() {
            return widgetTexts[curAuthenticationAction][curAuthenticationMethod].introMsg;
        }

        function getWidgetRefreshMessage() {
            return widgetTexts[curAuthenticationMethod].refreshTXT;
        }

        function getWidgetInitiationMessage() {
            return widgetTexts[curAuthenticationMethod].tsInitiated;
        }

        function getWidgetChangeMethodText() {
            return widgetTexts[curAuthenticationMethod].changeMethodText;
        }

        function getWidgetChangeMethodLinkTitle() {
            return widgetTexts[curAuthenticationMethod].changeMethodLinkTitle;
        }
        var clickedOnOpenApp = false;
        // This function is for changing widget method from Deeplinking to QR code and back
        function changeWidgetMethod(linkObj, eventObj) {
            
            if(deeplinkStr === curAuthenticationMethod) {
                curAuthenticationMethod = qrCodeStr;
                eventObj.preventDefault();
                clickedOnOpenApp = false;
            } else {
                curAuthenticationMethod = deeplinkStr;
                clickedOnOpenApp = true;
            }
            
            // isRefreshNeeded will be true if because of transaction failure
            // in that cause we need to create a new transaction
            if(linkObj.text() === widgetTexts[deeplinkStr].changeMethodLinkTitle) {
                
                if(isRefreshNeeded) {
                    
                    refresh();
                } else {
                    modal.find("#qrcode").html(qrcodeHTML);
                }
                
            } else {
                modal.find("#qrcode").html(deeplinkingHTML);
                modal.find("#deeplinkContainer").removeClass('hidden');
                /*if(isRefreshNeeded) {
                    refresh(function(response) {
                        
                        
                        window.location = response.deepLinkUrl
                    });
                } else if(deepLinkUrl) {
                    
                    
                    window.location =  deepLinkUrl;
                }
                return;*/
            }
            changeWidgetMessages();
        }

        // Change texts on widget based on change of widget method
        function changeWidgetMessages(source) {
            modal.find('#refreshTXT').html(getWidgetRefreshMessage());
            modal.find('#tsInitiated').html(getWidgetInitiationMessage());
            modal.find('.fs18').html(getWidgetTitle());
	        if(!source) {
                modal.find('#intro_msg').html(getWidgetIntroMsg());
            }            
	        successMsg = getWidgetSuccessmessage();
            modal.find('#change_method').html(getWidgetChangeMethodText());
            modal.find('#change_method_link').html(getWidgetChangeMethodLinkTitle());
        }

        //This will call when user coming back from Thumbsignin app
        thj(window).on('hashchange', function (e) {
            console.log('window.hashchange');
            openWidgetBasedOnURL();
        });
        //This will be fallback of hash change function
        window.onload = function () { 
            console.log('window.onload');
            openWidgetBasedOnURL();
        };

        //This will work when the App redirect user to browser with necessary 
        //details(as query string) for creating widget modal and check transaction status
        function openWidgetBasedOnURL() {
            
            if (window.location.hash.indexOf(widgetUrlParameterPart) > -1 && isMobile) {
                // cancelCheckStatusCall();
                setDefaultMethod();
                
                if(!source) {
                    var infoArray = window.location.hash.substr(1).split(widgetUrlParameterSeparator);
                    transId = infoArray[1];
                    actionUrl = infoArray[2];
                    statusUrl = infoArray[3];
                    clearInterval(timerHandle);
                    openWidgetModal();
                    checkTransaction(statusUrl + transId);
                } else {
                    changeWidgetMessages(source);
                }
            }
        }
      
        


        // thj(document).on("click", ".deeplink", function () {
        //     disableDeeplink();
        // });    
        
        function cancelCheckStatusCall() {
            
            if(source) {
                // source.cancel('Operation canceled by the user.');
            }
        }

        function getReturnURL(transactionId) {

            return encodeURI(window.location.href.substr(0, (-1 === window.location.href.indexOf('#')) ? window.location.href.length : window.location.href.indexOf('#')));
        }
        // This fuction make Deeplink and Method change link unclickable, make Transaction ID as 
        // false so that it won't call API for cancelling transaction
        // function disableDeeplink() {
            // thj('.deeplink').css('pointer-events', 'none');
            // manageChangeMethodLink('none');
            // cancelCheckStatusCall();
            // transId=false;
            // closeModal();
        // }
        // Calling this funcation will create a new Transaction, displaying QR Code or Deeplink
        // Start checking Transaction status if method is QRCOde
        function refresh(callbackFn) {
            resetModal();
            modal.find('.circle-loader').show();
            createTransaction(callbackFn);
        }
        // Binding refresh icon with regresh fuction
        thj(document).on("click", ".ts-timeout", function () {
            refresh();
        });


        // For enabling and disabling change method link
        function manageChangeMethodLink(cssValue) {
            if(isMobile) {
                modal.find('#change_method_link').css('pointer-events', cssValue);
                if('none' === cssValue) {
                    modal.find('#change_method_link').css('color', '#cccccc');
                } else {
                    modal.find('#change_method_link').css('color', '#337ab7');
                }
            }
        }

        var xhrCount = 0;
        // This is checking Transaction status and taking action accordingly 
        var CancelToken;
        var source;
        function checkTransaction(url) {
            if(!transId){
                return;
            }
            var seqNumber = ++xhrCount;

            CancelToken = axios.CancelToken;
            source = CancelToken.source();
            
            axios.get(url, {
                cancelToken: source.token
              }     ).then(function (response) {
                var res = response.data;
                
                if (res.status === 'COMPLETED_SUCCESSFUL') {
                    
                    transId = undefined;
                    thj('#qrcode').fadeOut("slow", function () {
                        // modal.find('.qr-time').hide();
                        modal.find('.circle-loader').addClass('load-complete').show();
                        modal.find('.checkmark').show();
                        modal.find('#intro_msg').text(successMsg);
                        modal.find('.intro-msg').show();
                        
                        setTimeout(function () {
                            closeModal();
                            window.location.hash = '';
                            if(ts.event['complete']){
                                var obj =ts.event['complete'];
                                obj.fn.call(obj.scope, res);
                            }
                            window.location.pathname = res.redirectUrl || "/";
                        }, 1000);
                        thj('.ts_initiated').hide();
                    });
                } else {
                    if (res.status === "PENDING") {
                        if(ts.event['pending']){
                            var obj =ts.event['pending'];
                            obj.fn.call(obj.scope, res);
                        }
                        
                        timerHandle = setTimeout(function () {
                            
                            if (seqNumber === xhrCount) {
                                url.split('?cancelled=true').length === 2 ? "" : checkTransaction(url);
                            } else {
                                console.log("Ignore the response");
                            }
                        }, 1500);
                    } else if (res.status === "INITIATED") {
                        if(ts.event['initiated']){
                            var obj =ts.event['initiated'];
                            obj.fn.call(obj.scope, res);
                        }
                        if(clickedOnOpenApp) {
                            thj('.ts_initiated').html(widgetTexts[deeplinkStr].tsInitiated);
                        }
                        thj('#qrcode').css('opacity', '.1');
                        thj('.ts_initiated').show();
                        modal.find('.intro-msg').show();
                        
                        timerHandle = setTimeout(function () {
                            
                            if (seqNumber === xhrCount) {
                                url.split('?cancelled=true').length === 2 ? "" : checkTransaction(url);
                            } else {
                                console.log("Ignore the response");
                            }
                        }, 1500);
                        manageChangeMethodLink('none');
                    } else if (res.status === "COMPLETED_FAILURE") {
                        
                        manageChangeMethodLink('none');
                        modal.find('.circle-loader').css('opacity', '0');
                        isRefreshNeeded = true;

                        if(ts.event['failure']){
                            var obj =ts.event['failure'];
                            obj.fn.call(obj.scope, res);
                        }

                        transId = undefined;
                        modal.find('.ts-timeout').fadeIn(function () {
                            thj('#qrcode').css('opacity', '1');
                        });
                        clearInterval(timerHandle);

                        if (res.failureReason === "ALREADY_REGISTERED") {
                            
                            modal.find('#intro_msg').html('You have already enabled passwordless authentication for this account using this device.').show();
                            
                        } else if (res.failureReason === "NOT_REGISTERED") {

                            modal.find('#intro_msg').html('Passwordless authentication not yet enabled using this device. Log in using your password to enable passwordless authentication.').show();
                        } else if (res.failureReason === "TIMEOUT") {
                            modal.find('#intro_msg').html('Transaction Expired').show();
                        } else if('NO_SUITABLE_AUTHENTICATOR' === res.failureReason) {
                            modal.find('#intro_msg').html('You have not added fingerprint in your device.').show();
                        } else if(res.failureReason === "DECLINED" || res.failureReason === "CANCELLED") {
                            modal.find('#intro_msg').html('Cancelled').show();
                        } else if(res.failureReason === "TECHNICAL_REASON") {
                            modal.find('#intro_msg').html('Please try again').show();
                        }
                        
                    } else if(res.status === "SERVER_ERROR") {
                        transId = undefined;
                        
                        modal.find('.ts-timeout').fadeIn(function () {
                            thj('#qrcode').css('opacity', '1');
                        });
                        clearInterval(timerHandle);
                        modal.find('#intro_msg').html('Please try again').show();
                    } else {
                        clearInterval(timerHandle);
                        console.log(res);
                        console.log('From Unknon status');
                        checkTransaction(url+'?cancelled=true');
                    }
                }
            }).catch(function (err) {
                console.log('Error: ' + err);
                modal.find('.circle-loader').css('opacity', '0');
                manageChangeMethodLink('none');
                clearInterval(timerHandle);
                transId = undefined;
                
                modal.find('.ts-timeout').fadeIn(function () {
                    thj('#qrcode').css('opacity', '1');
                });
                clearInterval(timerHandle);
                modal.find('#intro_msg').html('Please try again').show();
            });
        }
        // Get browser info for creating callback URL
        function getBrowser() {
           
            var userAgent = navigator.userAgent.toLowerCase();
            //Check if browser is IE or not
            if (userAgent.search("msie") >= 0) {
                return "internetexplorer";
            }
            //Check if browser is Safari or not
            else if (userAgent.search("safari") >= 0 && userAgent.search("chrome") < 0 && userAgent.search("fxios") < 0 && userAgent.search("crios") < 0) {
                return "safari";
            }
            //Check if browser is Chrome or not
            else if (userAgent.search("chrome") >= 0) {
                return "chrome";
            }
            //Check if browser is Chrome or not
            else if (userAgent.search("crios") >= 0) {
                return "chrome";
            }
            //Check if browser is Firefox or not
            else if (userAgent.search("firefox") >= 0) {
                return "firefox";
            }
            else if (userAgent.search("fxios") >= 0) {
                return "firefox";
            }
            //Check if browser is Opera or not
            else if (userAgent.search("opera") >= 0) {
                return "opera";
            }
            else if (userAgent.search("opios") >= 0) {
                return "opera";
            }
            else if (userAgent.search("ucbrowser") >= 0) {
                return "ucbrowser";
            }
        }
        // This is for closing widget, it also cancel Transaction if transaction id is valid
        var closeModal = function closeModal() {
            resetModal();
            modal.hide();
            // clearInterval(timerHandle);
            if (transId) {
                
                checkTransaction(statusUrl + transId + '?cancelled=true');
            }
        };

        modal.find(".closeIcon").click(closeModal);
        if(thj('#tsBtn').length > 0) {
            var tsBtn;
            tsBtn = thj('#tsBtn')
            tsBtn.css('border', '1px solid #48d2a0');
            tsBtn.css('background-color', '#48d2a0');
        }

        function bindSMSFunctions() {
            
            // Displaying SMS section 
            modal.find('.tsmodal-footer span').click(function () {
                thj('#sms_result').html("");
                thj("#phone").val('');
                thj('#sms_result').hide();
                modal.find('.more-info').show();
                thj("#phone").intlTelInput({
                    initialCountry: "auto",
                    geoIpLookup: function (callback) {
                        thj.get('https://ipinfo.io', function () { }, "jsonp").always(function (resp) {
                            var countryCode = (resp && resp.country) ? resp.country : "";
                            callback(countryCode);
                        });
                    }
                });
                modal.find('#phone').keyup(function(e){
                    var reg = new RegExp(/^\d+$/);
                    if(false === reg.test(modal.find('#phone').val())) {
                        modal.find('#phone').val('');
                    }
                    return;
                });
                modal.find('#phone').keydown(function (e) {
                    var key = String.fromCharCode(e.keyCode);
                    var reg = new RegExp(/^\d+$/);
                    return (reg.test(key) || e.keyCode == '8' || e.keyCode == '39' || e.keyCode == '46' || e.keyCode == '37');
                });
            });
            // Call API for sending SMS
            modal.find('.d-arrow-b').click(function () {
                var val = thj("#phone").intlTelInput("getNumber");
                if (val) {
                    if (10 === thj("#phone").val().length) {
                        axios.post('/sendSMS', { phone: val }).then(function (response) {
                            thj('#sms_result').html("SMS sent to your mobile");
                            thj('#sms_result').show();
                            setTimeout(function () {
                                thj('#sms_result').hide();
                            }, 2000);
                        }).catch(function (err) {
                            thj('#sms_result').html("Something wrong happened");
                            thj('#sms_result').show();
                            setTimeout(function () {
                                thj('#sms_result').hide();
                            }, 2000);
                            console.log('Error: ' + err);
                        });
                    } else {
                        thj('#sms_result').html("Please provide 10 digit phone number");
                        thj('#sms_result').show();
                        setTimeout(function () {
                            thj('#sms_result').hide();
                        }, 2000);
                    }
                } else {
                    thj('#sms_result').html("Please provide 10 digit phone number");
                    thj('#sms_result').show();
                    setTimeout(function () {
                        thj('#sms_result').hide();
                    }, 2000);
                }
            });
            thj('#get_link_by_sms').show();
        }
        
        getDependentFile('https://thumbsignin.com/intlTelInput.min.js', intlTelInputCheck, function () {
            getDependentFile('https://thumbsignin.com/styles/intlTelInput.css', checkStyleSheetExists, function () {
                bindSMSFunctions();
            });
        });
    }
    var registerEvent=function(event,_fn,scope){
        if(!event || typeof _fn !=='function') return;
        this.event[event]={fn:_fn,scope:scope};
    }
    return {
        event :[],
        registerEvent :registerEvent
    }
})();