
/********************************************************************/
/*                                                                  */
/*  Copyright (c) 2005-2011 DAMIANI                                 */
/*                                                                  */
/*  This obfuscated code was created by Jasob 4.0 Trial Version.    */
/*  The code may be used for evaluation purposes only.              */
/*  To obtain full rights to the obfuscated code you have to        */
/*  purchase the license key (http://www.jasob.com/Purchase.html).  */
/*                                                                  */
/********************************************************************/

chrome.app.runtime.onLaunched.addListener(function(){
	chrome.app.window.create("index.html",{
		id: 'main_window',
		minHeight:768,
		minWidth:1024
	});
}); 