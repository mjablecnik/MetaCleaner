/* eslint-disable */
import { getLocale, experimentalStaticLocale } from "../runtime.js"

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */
/** @typedef {{}} Common_Brandname1Inputs */
/** @typedef {{}} Common_Nav_Loggedinas2Inputs */
/** @typedef {{}} Common_Nav_Reporthistory1Inputs */
/** @typedef {{}} Common_Nav_SettingsInputs */
/** @typedef {{}} Common_Nav_LogoutInputs */
/** @typedef {{}} Common_Nav_LanguageInputs */
/** @typedef {{}} Common_Stats_FilesInputs */
/** @typedef {{}} Step1_Meta_TitleInputs */
/** @typedef {{}} Step1_Header_TitleInputs */
/** @typedef {{}} Step1_Header_DescriptionInputs */
/** @typedef {{}} Step1_Upload_TitleInputs */
/** @typedef {{}} Step1_Upload_Dropdesktop1Inputs */
/** @typedef {{}} Step1_Upload_Dropmobile1Inputs */
/** @typedef {{}} Step1_Upload_Orclickdesktop2Inputs */
/** @typedef {{}} Step1_Upload_Ordragmobile2Inputs */
/** @typedef {{}} Step1_Upload_PhotosInputs */
/** @typedef {{}} Step1_Upload_VideosInputs */
/** @typedef {{}} Step1_Upload_Maxsize1Inputs */
/** @typedef {{}} Step1_Upload_Maxsizemobile2Inputs */
/** @typedef {{}} Step1_Scan_PendingInputs */
/** @typedef {{}} Step1_Scan_ScanningInputs */
/** @typedef {{ scanned: NonNullable<unknown>, total: NonNullable<unknown> }} Step1_Scan_ProgressInputs */
/** @typedef {{}} Step1_Files_TitleInputs */
/** @typedef {{}} Step1_Files_Clearall1Inputs */
/** @typedef {{}} Step1_Status_Uploadprompt1Inputs */
/** @typedef {{}} Step2_Meta_TitleInputs */
/** @typedef {{}} Step2_Risk_TitleInputs */
/** @typedef {{}} Step2_Risk_ScoreInputs */
/** @typedef {{}} Step2_Risk_Leakprobable1Inputs */
/** @typedef {{}} Step2_Risk_DescriptionInputs */
/** @typedef {{}} Step2_Risk_Analysistitle1Inputs */
/** @typedef {{}} Step2_Risk_Gpscoordinates1Inputs */
/** @typedef {{}} Step2_Risk_CriticalInputs */
/** @typedef {{}} Step2_Risk_Deviceidentity1Inputs */
/** @typedef {{}} Step2_Risk_HighInputs */
/** @typedef {{}} Step2_Risk_Personaldata1Inputs */
/** @typedef {{}} Step2_Risk_MediumInputs */
/** @typedef {{}} Step2_Risk_TimestampInputs */
/** @typedef {{}} Step2_Risk_LowInputs */
/** @typedef {{}} Step2_Risk_NowInputs */
/** @typedef {{}} Step2_Risk_Aftercleaning1Inputs */
/** @typedef {{}} Step2_Risk_Cleanscore1Inputs */
/** @typedef {{}} Step2_Risk_Reducepre1Inputs */
/** @typedef {{}} Step2_Risk_Reducehighlight1Inputs */
/** @typedef {{}} Step2_Risk_Aiorigin1Inputs */
/** @typedef {{}} Step2_Risk_Chipai2Inputs */
/** @typedef {{}} Step2_Risk_Chipdevice1Inputs */
/** @typedef {{}} Step2_Risk_Chippersonal1Inputs */
/** @typedef {{}} Step2_Files_Addmore1Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step2_Files_Metadatafields1Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step2_Files_Metadatafieldsmobile2Inputs */
/** @typedef {{}} Step2_Files_Gpsfound1Inputs */
/** @typedef {{}} Step2_Files_Aigenerated1Inputs */
/** @typedef {{}} Step2_Files_Scanerror1Inputs */
/** @typedef {{}} Step2_Risk_Scanfailed1Inputs */
/** @typedef {{}} Step2_Risk_Scanfaileddesc2Inputs */
/** @typedef {{}} Step3_Meta_TitleInputs */
/** @typedef {{}} Step3_Badge_Inprogressdesktop2Inputs */
/** @typedef {{}} Step3_Badge_Inprogressmobile2Inputs */
/** @typedef {{}} Step3_Status_TitleInputs */
/** @typedef {{}} Step3_Status_Inprogress1Inputs */
/** @typedef {{}} Step3_Status_Cleaninginprogress2Inputs */
/** @typedef {{}} Step3_Status_ProcessingInputs */
/** @typedef {{}} Step3_Progress_OverallInputs */
/** @typedef {{ done: NonNullable<unknown>, total: NonNullable<unknown> }} Step3_Progress_Filescompleted1Inputs */
/** @typedef {{ time: NonNullable<unknown> }} Step3_Progress_Timeremaining1Inputs */
/** @typedef {{}} Step3_Files_Fieldsremoved1Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step3_Files_Gpsandfieldsremoved3Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step3_Files_Gpsandfieldsremovedmobile4Inputs */
/** @typedef {{}} Step3_Files_ProcessingInputs */
/** @typedef {{}} Step3_Files_Waitinginqueue2Inputs */
/** @typedef {{}} Step3_Stats_Fieldsdeleted1Inputs */
/** @typedef {{}} Step3_Stats_DoneInputs */
/** @typedef {{ filename: NonNullable<unknown> }} Step3_Status_Processingfilelong2Inputs */
/** @typedef {{}} Step3_Actions_StopInputs */
/** @typedef {{}} Step3_Log_TitleInputs */
/** @typedef {{ count: NonNullable<unknown> }} Step3_Log_Gpssuccess1Inputs */
/** @typedef {{ pct: NonNullable<unknown> }} Step3_Log_Inprogress1Inputs */
/** @typedef {{}} Step3_Log_WaitingInputs */
/** @typedef {{}} Step4_Meta_TitleInputs */
/** @typedef {{}} Step4_Badge_Errordesktop1Inputs */
/** @typedef {{}} Step4_Badge_Errormobile1Inputs */
/** @typedef {{}} Step4_Error_Processfailedtitle2Inputs */
/** @typedef {{}} Step4_Error_Descriptiondesktop1Inputs */
/** @typedef {{}} Step4_Error_Cleaningfailed1Inputs */
/** @typedef {{}} Step4_Error_Couldnotprocess2Inputs */
/** @typedef {{}} Step4_Error_InterruptedInputs */
/** @typedef {{}} Step4_Error_Processingfailed1Inputs */
/** @typedef {{}} Step4_Error_Failedshort1Inputs */
/** @typedef {{}} Step4_Error_SkippedInputs */
/** @typedef {{}} Step4_Detail_TitleInputs */
/** @typedef {{}} Step4_Detail_DescriptionInputs */
/** @typedef {{}} Step4_Detail_Errorcode1Inputs */
/** @typedef {{}} Step4_Detail_Errortime1Inputs */
/** @typedef {{}} Step4_Detail_FileInputs */
/** @typedef {{}} Step4_Detail_PhaseInputs */
/** @typedef {{}} Step4_Type_TitleInputs */
/** @typedef {{}} Step4_Type_Cleaning_TitleInputs */
/** @typedef {{}} Step4_Type_Cleaning_DescriptionInputs */
/** @typedef {{}} Step4_Type_Connection_TitleInputs */
/** @typedef {{}} Step4_Type_Connection_DescriptionInputs */
/** @typedef {{}} Step4_Type_Timeout_TitleInputs */
/** @typedef {{}} Step4_Type_Timeout_DescriptionInputs */
/** @typedef {{}} Step4_Log_TitleInputs */
/** @typedef {{}} Step4_Actions_Tryagain1Inputs */
/** @typedef {{}} Step4_Actions_Clearall1Inputs */
/** @typedef {{}} Step5_Meta_TitleInputs */
/** @typedef {{}} Step5_Header_TitleInputs */
/** @typedef {{ count: NonNullable<unknown> }} Step5_Header_Descriptiondesktop1Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step5_Header_Descriptionmobile1Inputs */
/** @typedef {{}} Step5_Actions_Uploadnew1Inputs */
/** @typedef {{}} Step5_Badge_SuccessInputs */
/** @typedef {{}} Step5_Stats_Filesprocessed1Inputs */
/** @typedef {{}} Step5_Stats_Fieldsremoved1Inputs */
/** @typedef {{}} Step5_Stats_Gpsremoved1Inputs */
/** @typedef {{}} Step5_Stats_Totaltime1Inputs */
/** @typedef {{}} Step5_Metadata_TitleInputs */
/** @typedef {{}} Step5_Metadata_BeforeInputs */
/** @typedef {{}} Step5_Metadata_AfterInputs */
/** @typedef {{}} Step5_Metadata_Beforedesc1Inputs */
/** @typedef {{}} Step5_Metadata_Afterdesc1Inputs */
/** @typedef {{}} Step5_Metadata_GpsInputs */
/** @typedef {{}} Step5_Metadata_ExifInputs */
/** @typedef {{}} Step5_Metadata_XmpInputs */
/** @typedef {{}} Step5_Metadata_OtherInputs */
/** @typedef {{}} Step5_Metadata_RemovedInputs */
/** @typedef {{ count: NonNullable<unknown> }} Step5_Metadata_Totalexposed1Inputs */
/** @typedef {{}} Step5_Metadata_Allclean1Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step5_Metadata_Highriskwarning2Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step5_Metadata_Filescount1Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step5_Metadata_Fieldscount1Inputs */
/** @typedef {{}} Step5_Metadata_Allremovedsuccess2Inputs */
/** @typedef {{}} Step5_Metadata_Totalrisk1Inputs */
/** @typedef {{}} Step5_Metadata_Riskhigh1Inputs */
/** @typedef {{}} Step5_Metadata_Risknone1Inputs */
/** @typedef {{}} Step5_Metadata_Id3mp4Inputs */
/** @typedef {{}} Step5_Results_TitleInputs */
/** @typedef {{}} Step5_Results_Alldone1Inputs */
/** @typedef {{}} Step5_Results_Gpsremoved1Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step5_Results_Fieldscount1Inputs */
/** @typedef {{}} Step5_Actions_Downloadall1Inputs */
/** @typedef {{}} Step5_Actions_Viewreport1Inputs */
/** @typedef {{}} Reports_Meta_TitleInputs */
/** @typedef {{}} Reports_Header_TitleInputs */
/** @typedef {{}} Reports_Header_SubtitleInputs */
/** @typedef {{ count: NonNullable<unknown> }} Reports_Header_Totalreports1Inputs */
/** @typedef {{}} Reports_Header_Newcleaning1Inputs */
/** @typedef {{}} Reports_Header_Newshort1Inputs */
/** @typedef {{}} Reports_Nav_Backtocleaning2Inputs */
/** @typedef {{}} Reports_Stats_Totalreports1Inputs */
/** @typedef {{}} Reports_Stats_Fieldsremoved1Inputs */
/** @typedef {{}} Reports_Stats_Filesprocessed1Inputs */
/** @typedef {{}} Reports_Stats_Gpsremoved1Inputs */
/** @typedef {{}} Reports_Filter_LabelInputs */
/** @typedef {{}} Reports_Filter_AllInputs */
/** @typedef {{}} Reports_Filter_SuccessfulInputs */
/** @typedef {{}} Reports_Filter_Containedgps1Inputs */
/** @typedef {{}} Reports_Filter_PhotosInputs */
/** @typedef {{}} Reports_Filter_VideoInputs */
/** @typedef {{}} Reports_Search_PlaceholderInputs */
/** @typedef {{}} Reports_Table_TitleInputs */
/** @typedef {{ filtered: NonNullable<unknown>, total: NonNullable<unknown> }} Reports_Table_ShownInputs */
/** @typedef {{}} Reports_Table_IdInputs */
/** @typedef {{}} Reports_Table_DateInputs */
/** @typedef {{}} Reports_Table_FilesInputs */
/** @typedef {{}} Reports_Table_FieldsInputs */
/** @typedef {{}} Reports_Table_TagsInputs */
/** @typedef {{}} Reports_Table_StatusInputs */
/** @typedef {{}} Reports_Table_ActionsInputs */
/** @typedef {{}} Reports_Table_Fieldsremoved1Inputs */
/** @typedef {{}} Reports_Table_Fieldsmobile1Inputs */
/** @typedef {{}} Reports_Table_Noresults1Inputs */
/** @typedef {{}} Reports_Table_Viewreport1Inputs */
/** @typedef {{}} Reports_Table_Downloadpdf1Inputs */
/** @typedef {{}} Reports_Stats_Fieldsremovedshort2Inputs */
/** @typedef {{}} Reports_Stats_Gpsremovedshort2Inputs */
/** @typedef {{}} Reports_Filter_Containedgpsshort2Inputs */
/** @typedef {{}} Reports_Filter_Photosshort1Inputs */
/** @typedef {{}} Reports_Filecount_One1Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Reports_Filecount_Few1Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Reports_Filecount_Many1Inputs */
/** @typedef {{}} Reports_Toast_DownloadingInputs */
/** @typedef {{}} Report_Meta_TitleInputs */
/** @typedef {{}} Report_Header_TitleInputs */
/** @typedef {{}} Report_Header_GeneratedInputs */
/** @typedef {{}} Report_Actions_Downloadpdf1Inputs */
/** @typedef {{}} Report_Actions_Downloadpdfshort2Inputs */
/** @typedef {{}} Report_Actions_PrintInputs */
/** @typedef {{}} Report_Nav_Backtoresults2Inputs */
/** @typedef {{}} Report_Meta_Reportid1Inputs */
/** @typedef {{}} Report_Meta_Cleaningdate1Inputs */
/** @typedef {{}} Report_Meta_UserInputs */
/** @typedef {{}} Report_Meta_StatusInputs */
/** @typedef {{}} Report_Meta_Statussuccess1Inputs */
/** @typedef {{}} Report_Meta_Statussuccessmobile2Inputs */
/** @typedef {{}} Report_Stats_Filesprocessed1Inputs */
/** @typedef {{}} Report_Stats_Fieldsremoved1Inputs */
/** @typedef {{}} Report_Stats_Gpsremoved1Inputs */
/** @typedef {{}} Report_Stats_Totaltime1Inputs */
/** @typedef {{}} Report_Chart_Distributiontitle1Inputs */
/** @typedef {{}} Report_Chart_Distributiondesc1Inputs */
/** @typedef {{}} Report_Chart_Perfiletitle2Inputs */
/** @typedef {{}} Report_Chart_Perfiledesc2Inputs */
/** @typedef {{}} Report_Chart_Totalremoved1Inputs */
/** @typedef {{}} Report_Chart_FieldsInputs */
/** @typedef {{}} Report_Chart_Gpsdata1Inputs */
/** @typedef {{}} Report_Chart_Exifdata1Inputs */
/** @typedef {{}} Report_Chart_Xmpdata1Inputs */
/** @typedef {{}} Report_Chart_Id3data1Inputs */
/** @typedef {{}} Report_Chart_Mp4data1Inputs */
/** @typedef {{}} Report_Files_TitleInputs */
/** @typedef {{}} Report_Files_Collapseall1Inputs */
/** @typedef {{}} Report_Files_Expandall1Inputs */
/** @typedef {{}} Report_Files_Safetoshare2Inputs */
/** @typedef {{}} Report_Files_Metadatafields1Inputs */
/** @typedef {{}} Report_Files_MoreInputs */
/** @typedef {{}} Report_Files_RemovedInputs */
/** @typedef {{ date: NonNullable<unknown>, files: NonNullable<unknown>, fields: NonNullable<unknown> }} Report_Header_Generateddesc1Inputs */
/** @typedef {{}} Common_LoadingInputs */
/** @typedef {{}} Common_ErrorInputs */
/** @typedef {{}} Common_Downloaderror1Inputs */
/** @typedef {{}} Common_Footer_CopyrightInputs */
/** @typedef {{ count: NonNullable<unknown> }} Step1_Upload_Rejectedtoolarge2Inputs */
/** @typedef {{ count: NonNullable<unknown> }} Step1_Upload_Rejectedunsupported1Inputs */
/** @typedef {{}} Step1_Status_WaitingInputs */
/** @typedef {{}} Common_Startcleaning1Inputs */
/** @typedef {{}} Common_DownloadInputs */
/** @typedef {{}} Common_Downloadzip1Inputs */
/** @typedef {{}} Common_Viewreport1Inputs */
/** @typedef {{}} Common_DismissInputs */
/** @typedef {{}} Common_Removefile1Inputs */
/** @typedef {{}} Common_Openmenu1Inputs */
/** @typedef {{}} Common_Closemenu1Inputs */
/** @typedef {{}} Common_Goback1Inputs */
/** @typedef {{ score: NonNullable<unknown>, severity: NonNullable<unknown> }} Step2_Risk_Srannouncement1Inputs */
/** @typedef {{}} Auth_Common_Trust_SslInputs */
/** @typedef {{}} Auth_Common_Trust_GdprInputs */
/** @typedef {{}} Auth_Common_Trust_Notracking1Inputs */
/** @typedef {{}} Auth_Common_Trust_Sslshort1Inputs */
/** @typedef {{}} Auth_Common_Trust_Gdprshort1Inputs */
/** @typedef {{}} Auth_Common_Stats_Userslabel1Inputs */
/** @typedef {{}} Auth_Common_Stats_Filescleanedlabel2Inputs */
/** @typedef {{}} Auth_Common_Stats_Securitylabel1Inputs */
/** @typedef {{}} Auth_Common_Nav_LoginInputs */
/** @typedef {{}} Auth_Common_Nav_RememberedInputs */
/** @typedef {{}} Auth_Common_Nav_Backtologin2Inputs */
/** @typedef {{}} Auth_Common_Nav_BackInputs */
/** @typedef {{}} Auth_Common_Nav_Backtocode2Inputs */
/** @typedef {{}} Auth_Common_A11y_Hidepassword1Inputs */
/** @typedef {{}} Auth_Common_A11y_Showpassword1Inputs */
/** @typedef {{}} Auth_Common_Validation_Emailinvalid1Inputs */
/** @typedef {{}} Auth_Common_Validation_Passwordmin81Inputs */
/** @typedef {{}} Auth_Common_Validation_Passwordsmismatch1Inputs */
/** @typedef {{}} Auth_Common_Validation_Passwordsmatch1Inputs */
/** @typedef {{}} Auth_Common_Validation_Otpincomplete1Inputs */
/** @typedef {{}} Auth_Common_Validation_Passwordsmismatchorshort3Inputs */
/** @typedef {{}} Auth_Common_Strength_Veryweak1Inputs */
/** @typedef {{}} Auth_Common_Strength_WeakInputs */
/** @typedef {{}} Auth_Common_Strength_AverageInputs */
/** @typedef {{}} Auth_Common_Strength_GoodInputs */
/** @typedef {{}} Auth_Common_Strength_StrongInputs */
/** @typedef {{}} Auth_Common_Strength_Weakpassword1Inputs */
/** @typedef {{}} Auth_Common_Strength_Addmore1Inputs */
/** @typedef {{}} Auth_Common_Strength_Averagepassword1Inputs */
/** @typedef {{}} Auth_Common_Strength_Couldbestronger2Inputs */
/** @typedef {{}} Auth_Common_Strength_Strongpassword1Inputs */
/** @typedef {{}} Auth_Common_Strength_Almostperfect1Inputs */
/** @typedef {{}} Auth_Common_Strength_Verystrongpassword2Inputs */
/** @typedef {{}} Auth_Common_Strength_ExcellentInputs */
/** @typedef {{}} Auth_Common_Requirements_TitleInputs */
/** @typedef {{}} Auth_Common_Requirements_Min8Inputs */
/** @typedef {{}} Auth_Common_Requirements_UppercaseInputs */
/** @typedef {{}} Auth_Common_Requirements_NumberInputs */
/** @typedef {{}} Auth_Common_Requirements_Uppercasefull1Inputs */
/** @typedef {{}} Auth_Common_Requirements_LowercaseInputs */
/** @typedef {{}} Auth_Common_Requirements_Numberfull1Inputs */
/** @typedef {{}} Auth_Common_Requirements_SpecialInputs */
/** @typedef {{}} Auth_Common_Field_Emaillabel1Inputs */
/** @typedef {{}} Auth_Common_Field_Emailplaceholder1Inputs */
/** @typedef {{}} Auth_Common_Field_Passwordlabel1Inputs */
/** @typedef {{}} Auth_Common_Field_Confirmpasswordlabel2Inputs */
/** @typedef {{}} Auth_Common_Field_Newpasswordlabel2Inputs */
/** @typedef {{}} Auth_Common_Divider_Oremail1Inputs */
/** @typedef {{}} Auth_Common_Action_ResendInputs */
/** @typedef {{}} Auth_Common_Submit_SavingInputs */
/** @typedef {{}} Auth_Common_Submit_Setnewpassword2Inputs */
/** @typedef {{}} Auth_Common_Success_Passwordchanged1Inputs */
/** @typedef {{}} Auth_Common_Success_Passwordchangeddesc2Inputs */
/** @typedef {{}} Auth_Common_Success_EncryptedInputs */
/** @typedef {{}} Auth_Common_Tip_PrefixInputs */
/** @typedef {{}} Auth_Login_Meta_TitleInputs */
/** @typedef {{}} Auth_Login_Nav_Noaccount1Inputs */
/** @typedef {{}} Auth_Login_Nav_RegisterInputs */
/** @typedef {{}} Auth_Login_Branding_HeadlineInputs */
/** @typedef {{}} Auth_Login_Branding_Headlinehighlight1Inputs */
/** @typedef {{}} Auth_Login_Branding_Headlineafter1Inputs */
/** @typedef {{}} Auth_Login_Branding_DescriptionInputs */
/** @typedef {{}} Auth_Login_Feature_Securetitle1Inputs */
/** @typedef {{}} Auth_Login_Feature_Securedesc1Inputs */
/** @typedef {{}} Auth_Login_Feature_Securebadge1Inputs */
/** @typedef {{}} Auth_Login_Feature_Fasttitle1Inputs */
/** @typedef {{}} Auth_Login_Feature_Fastdesc1Inputs */
/** @typedef {{}} Auth_Login_Feature_Fastbadge1Inputs */
/** @typedef {{}} Auth_Login_Feature_Formatstitle1Inputs */
/** @typedef {{}} Auth_Login_Feature_Formatsdesc1Inputs */
/** @typedef {{}} Auth_Login_Form_TitleInputs */
/** @typedef {{}} Auth_Login_Form_SubtitleInputs */
/** @typedef {{}} Auth_Login_Social_GoogleInputs */
/** @typedef {{}} Auth_Login_Social_AppleInputs */
/** @typedef {{}} Auth_Login_Divider_Oremail1Inputs */
/** @typedef {{}} Auth_Login_Field_Emaillabel1Inputs */
/** @typedef {{}} Auth_Login_Field_Emailplaceholder1Inputs */
/** @typedef {{}} Auth_Login_Field_Passwordlabel1Inputs */
/** @typedef {{}} Auth_Login_Field_Forgotpassword1Inputs */
/** @typedef {{}} Auth_Login_Field_RememberInputs */
/** @typedef {{}} Auth_Login_Submit_IdleInputs */
/** @typedef {{}} Auth_Login_Submit_LoadingInputs */
/** @typedef {{}} Auth_Login_Submit_SuccessInputs */
/** @typedef {{}} Auth_Login_Footer_Noaccount1Inputs */
/** @typedef {{}} Auth_Login_Footer_Registerfree1Inputs */
/** @typedef {{}} Auth_Login_Validation_Passwordshort1Inputs */
/** @typedef {{}} Auth_Login_Validation_Passwordempty1Inputs */
/** @typedef {{}} Auth_Login_Magic_DividerInputs */
/** @typedef {{}} Auth_Login_Magic_SendInputs */
/** @typedef {{}} Auth_Login_Magic_SendingInputs */
/** @typedef {{}} Auth_Login_Magic_Successtitle1Inputs */
/** @typedef {{}} Auth_Login_Magic_Successdesc1Inputs */
/** @typedef {{}} Auth_Login_Magic_Backtologin2Inputs */
/** @typedef {{}} Auth_Register_Meta_TitleInputs */
/** @typedef {{}} Auth_Register_Nav_Hasaccount1Inputs */
/** @typedef {{}} Auth_Register_Badge_Freeforever1Inputs */
/** @typedef {{}} Auth_Register_Branding_HeadlineInputs */
/** @typedef {{}} Auth_Register_Branding_Headlinehighlight1Inputs */
/** @typedef {{}} Auth_Register_Branding_DescriptionInputs */
/** @typedef {{}} Auth_Register_Plan_TitleInputs */
/** @typedef {{}} Auth_Register_Plan_Freename1Inputs */
/** @typedef {{}} Auth_Register_Plan_Freebadge1Inputs */
/** @typedef {{}} Auth_Register_Plan_Freedesc1Inputs */
/** @typedef {{}} Auth_Register_Plan_Proname1Inputs */
/** @typedef {{}} Auth_Register_Plan_Probadge1Inputs */
/** @typedef {{}} Auth_Register_Plan_Prodesc1Inputs */
/** @typedef {{}} Auth_Register_Plan_Titlemobile1Inputs */
/** @typedef {{}} Auth_Register_Benefit_Nocard1Inputs */
/** @typedef {{}} Auth_Register_Benefit_GdprInputs */
/** @typedef {{}} Auth_Register_Benefit_E2eInputs */
/** @typedef {{}} Auth_Register_Benefit_CancelInputs */
/** @typedef {{}} Auth_Register_Mobile_DescriptionInputs */
/** @typedef {{}} Auth_Register_Form_TitleInputs */
/** @typedef {{}} Auth_Register_Form_SubtitleInputs */
/** @typedef {{}} Auth_Register_Social_GoogleInputs */
/** @typedef {{}} Auth_Register_Social_AppleInputs */
/** @typedef {{}} Auth_Register_Field_Firstname1Inputs */
/** @typedef {{}} Auth_Register_Field_Firstnameplaceholder2Inputs */
/** @typedef {{}} Auth_Register_Field_Lastname1Inputs */
/** @typedef {{}} Auth_Register_Field_Lastnameplaceholder2Inputs */
/** @typedef {{}} Auth_Register_Field_Passwordplaceholder1Inputs */
/** @typedef {{}} Auth_Register_Field_Confirmplaceholder1Inputs */
/** @typedef {{}} Auth_Register_Terms_AgreeInputs */
/** @typedef {{}} Auth_Register_Terms_TosInputs */
/** @typedef {{}} Auth_Register_Terms_AndInputs */
/** @typedef {{}} Auth_Register_Terms_PrivacyInputs */
/** @typedef {{}} Auth_Register_Submit_IdleInputs */
/** @typedef {{}} Auth_Register_Submit_LoadingInputs */
/** @typedef {{}} Auth_Register_Submit_SuccessInputs */
/** @typedef {{}} Auth_Register_Footer_Hasaccount1Inputs */
/** @typedef {{}} Auth_Register_Footer_LoginInputs */
/** @typedef {{}} Auth_Register_Stats_Cleanedlabel1Inputs */
/** @typedef {{}} Auth_Register_Validation_Firstnamerequired2Inputs */
/** @typedef {{}} Auth_Register_Validation_Lastnamerequired2Inputs */
/** @typedef {{}} Auth_Register_Validation_Termsrequired1Inputs */
/** @typedef {{}} Auth_Checkemail_Meta_Title1Inputs */
/** @typedef {{}} Auth_Checkemail_Badge_Created1Inputs */
/** @typedef {{}} Auth_Checkemail_Heading_Almostdone2Inputs */
/** @typedef {{}} Auth_Checkemail_Heading_Verify1Inputs */
/** @typedef {{}} Auth_Checkemail_Heading_Emailhighlight2Inputs */
/** @typedef {{}} Auth_Checkemail_Heading_Description1Inputs */
/** @typedef {{}} Auth_Checkemail_Step_Accountcreated2Inputs */
/** @typedef {{}} Auth_Checkemail_Step_Accountcreateddesc3Inputs */
/** @typedef {{}} Auth_Checkemail_Step_Verifyemail2Inputs */
/** @typedef {{}} Auth_Checkemail_Step_Currentstep2Inputs */
/** @typedef {{}} Auth_Checkemail_Step_Clicklink2Inputs */
/** @typedef {{}} Auth_Checkemail_Step_Startusing2Inputs */
/** @typedef {{}} Auth_Checkemail_Step_Fullaccess2Inputs */
/** @typedef {{}} Auth_Checkemail_Card_Title1Inputs */
/** @typedef {{}} Auth_Checkemail_Card_Sentto2Inputs */
/** @typedef {{}} Auth_Checkemail_Divider_Waiting1Inputs */
/** @typedef {{}} Auth_Checkemail_Waiting_Title1Inputs */
/** @typedef {{}} Auth_Checkemail_Waiting_Autorefresh2Inputs */
/** @typedef {{}} Auth_Checkemail_Progress_Linkvalidity2Inputs */
/** @typedef {{}} Auth_Checkemail_Progress_Expiresin24h2Inputs */
/** @typedef {{}} Auth_Checkemail_Divider_Or1Inputs */
/** @typedef {{}} Auth_Checkemail_Resend_Loading1Inputs */
/** @typedef {{}} Auth_Checkemail_Resend_Idle1Inputs */
/** @typedef {{}} Auth_Checkemail_Changeemail2Inputs */
/** @typedef {{}} Auth_Checkemail_Tips_Title1Inputs */
/** @typedef {{}} Auth_Checkemail_Tips_Checkfolder2Inputs */
/** @typedef {{}} Auth_Checkemail_Tips_Spam1Inputs */
/** @typedef {{}} Auth_Checkemail_Tips_Bulk1Inputs */
/** @typedef {{}} Auth_Checkemail_Tips_Delay1Inputs */
/** @typedef {{}} Auth_Checkemail_Tips_Delaytime2Inputs */
/** @typedef {{}} Auth_Checkemail_Tips_Validfor2Inputs */
/** @typedef {{}} Auth_Checkemail_Tips_Validtime2Inputs */
/** @typedef {{}} Auth_Checkemail_Mobile_Stepcreated2Inputs */
/** @typedef {{}} Auth_Checkemail_Mobile_Stepverify2Inputs */
/** @typedef {{}} Auth_Checkemail_Mobile_Stepstart2Inputs */
/** @typedef {{}} Auth_Checkemail_Toast_Resent1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Meta_Title1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Branding_Headline1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Branding_Headlinehighlight2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Branding_Headlineafter2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Branding_Subtitle1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Branding_Description1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Step1_Title1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Step1_Desc1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Step2_Title1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Step2_Desc1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Step3_Title1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Step3_Desc1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Security_Title1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Security_Description1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Form_Title1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Form_Subtitle1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Form_Description1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Submit_Sendcode2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Mobile_Step1desc2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Mobile_Step2desc2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Mobile_Step3title2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Mobile_Step3desc2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Otp_Title1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Otp_Steplabel2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Otp_Sentto2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Otp_Expiresin2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Otp_Verify1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Newpassword_Title2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Newpassword_Steplabel3Inputs */
/** @typedef {{}} Auth_Forgotpassword_Newpassword_Description2Inputs */
/** @typedef {{}} Auth_Forgotpassword_Success_Title1Inputs */
/** @typedef {{}} Auth_Forgotpassword_Success_Description1Inputs */
/** @typedef {{}} Auth_Checkcode_Meta_Title1Inputs */
/** @typedef {{}} Auth_Checkcode_Hint_Title1Inputs */
/** @typedef {{ email: NonNullable<unknown> }} Auth_Checkcode_Hint_Description1Inputs */
/** @typedef {{}} Auth_Checkcode_Otp_Sentto2Inputs */
/** @typedef {{}} Auth_Checkcode_Countdown_Label1Inputs */
/** @typedef {{}} Auth_Checkcode_Help_Description1Inputs */
/** @typedef {{}} Auth_Newpassword_Meta_Title1Inputs */
/** @typedef {{}} Auth_Newpassword_Branding_Headline1Inputs */
/** @typedef {{}} Auth_Newpassword_Branding_Description1Inputs */
/** @typedef {{}} Auth_Newpassword_Step1_Donedesc2Inputs */
/** @typedef {{}} Auth_Newpassword_Step2_Donedesc2Inputs */
/** @typedef {{}} Auth_Newpassword_Tip_Title1Inputs */
/** @typedef {{}} Auth_Newpassword_Tip_Description1Inputs */
/** @typedef {{}} Auth_Newpassword_Mobile_Headline1Inputs */
/** @typedef {{}} Auth_Newpassword_Mobile_Subtitle1Inputs */
/** @typedef {{}} Auth_Newpassword_Form_Description1Inputs */
/** @typedef {{}} Auth_Newpassword_Mobile_Tip1Inputs */
import * as __en from "./en.js"
import * as __cs from "./cs.js"
/**
* | output |
* | --- |
* | "MetaCleaner" |
*
* @param {Common_Brandname1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_brandname1 = /** @type {((inputs?: Common_Brandname1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Brandname1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_brandname1(inputs)
	return __cs.common_brandname1(inputs)
});
export { common_brandname1 as "common.brandName" }
/**
* | output |
* | --- |
* | "Logged in as" |
*
* @param {Common_Nav_Loggedinas2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_loggedinas2 = /** @type {((inputs?: Common_Nav_Loggedinas2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_Loggedinas2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_nav_loggedinas2(inputs)
	return __cs.common_nav_loggedinas2(inputs)
});
export { common_nav_loggedinas2 as "common.nav.loggedInAs" }
/**
* | output |
* | --- |
* | "Report history" |
*
* @param {Common_Nav_Reporthistory1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_reporthistory1 = /** @type {((inputs?: Common_Nav_Reporthistory1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_Reporthistory1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_nav_reporthistory1(inputs)
	return __cs.common_nav_reporthistory1(inputs)
});
export { common_nav_reporthistory1 as "common.nav.reportHistory" }
/**
* | output |
* | --- |
* | "Settings" |
*
* @param {Common_Nav_SettingsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_settings = /** @type {((inputs?: Common_Nav_SettingsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_SettingsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_nav_settings(inputs)
	return __cs.common_nav_settings(inputs)
});
export { common_nav_settings as "common.nav.settings" }
/**
* | output |
* | --- |
* | "Log out" |
*
* @param {Common_Nav_LogoutInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_logout = /** @type {((inputs?: Common_Nav_LogoutInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_LogoutInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_nav_logout(inputs)
	return __cs.common_nav_logout(inputs)
});
export { common_nav_logout as "common.nav.logout" }
/**
* | output |
* | --- |
* | "Language" |
*
* @param {Common_Nav_LanguageInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_nav_language = /** @type {((inputs?: Common_Nav_LanguageInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Nav_LanguageInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_nav_language(inputs)
	return __cs.common_nav_language(inputs)
});
export { common_nav_language as "common.nav.language" }
/**
* | output |
* | --- |
* | "Files" |
*
* @param {Common_Stats_FilesInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_stats_files = /** @type {((inputs?: Common_Stats_FilesInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Stats_FilesInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_stats_files(inputs)
	return __cs.common_stats_files(inputs)
});
export { common_stats_files as "common.stats.files" }
/**
* | output |
* | --- |
* | "MetaCleaner — Metadata Cleaning" |
*
* @param {Step1_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_meta_title = /** @type {((inputs?: Step1_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_meta_title(inputs)
	return __cs.step1_meta_title(inputs)
});
export { step1_meta_title as "step1.meta.title" }
/**
* | output |
* | --- |
* | "Metadata Cleaning" |
*
* @param {Step1_Header_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_header_title = /** @type {((inputs?: Step1_Header_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Header_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_header_title(inputs)
	return __cs.step1_header_title(inputs)
});
export { step1_header_title as "step1.header.title" }
/**
* | output |
* | --- |
* | "Upload files and remove hidden metadata locally on your device." |
*
* @param {Step1_Header_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_header_description = /** @type {((inputs?: Step1_Header_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Header_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_header_description(inputs)
	return __cs.step1_header_description(inputs)
});
export { step1_header_description as "step1.header.description" }
/**
* | output |
* | --- |
* | "Upload files" |
*
* @param {Step1_Upload_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_title = /** @type {((inputs?: Step1_Upload_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_title(inputs)
	return __cs.step1_upload_title(inputs)
});
export { step1_upload_title as "step1.upload.title" }
/**
* | output |
* | --- |
* | "Drag files here" |
*
* @param {Step1_Upload_Dropdesktop1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_dropdesktop1 = /** @type {((inputs?: Step1_Upload_Dropdesktop1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Dropdesktop1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_dropdesktop1(inputs)
	return __cs.step1_upload_dropdesktop1(inputs)
});
export { step1_upload_dropdesktop1 as "step1.upload.dropDesktop" }
/**
* | output |
* | --- |
* | "Tap to select files" |
*
* @param {Step1_Upload_Dropmobile1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_dropmobile1 = /** @type {((inputs?: Step1_Upload_Dropmobile1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Dropmobile1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_dropmobile1(inputs)
	return __cs.step1_upload_dropmobile1(inputs)
});
export { step1_upload_dropmobile1 as "step1.upload.dropMobile" }
/**
* | output |
* | --- |
* | "or click to select from device" |
*
* @param {Step1_Upload_Orclickdesktop2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_orclickdesktop2 = /** @type {((inputs?: Step1_Upload_Orclickdesktop2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Orclickdesktop2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_orclickdesktop2(inputs)
	return __cs.step1_upload_orclickdesktop2(inputs)
});
export { step1_upload_orclickdesktop2 as "step1.upload.orClickDesktop" }
/**
* | output |
* | --- |
* | "or drag files here" |
*
* @param {Step1_Upload_Ordragmobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_ordragmobile2 = /** @type {((inputs?: Step1_Upload_Ordragmobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Ordragmobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_ordragmobile2(inputs)
	return __cs.step1_upload_ordragmobile2(inputs)
});
export { step1_upload_ordragmobile2 as "step1.upload.orDragMobile" }
/**
* | output |
* | --- |
* | "Photos" |
*
* @param {Step1_Upload_PhotosInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_photos = /** @type {((inputs?: Step1_Upload_PhotosInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_PhotosInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_photos(inputs)
	return __cs.step1_upload_photos(inputs)
});
export { step1_upload_photos as "step1.upload.photos" }
/**
* | output |
* | --- |
* | "Videos" |
*
* @param {Step1_Upload_VideosInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_videos = /** @type {((inputs?: Step1_Upload_VideosInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_VideosInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_videos(inputs)
	return __cs.step1_upload_videos(inputs)
});
export { step1_upload_videos as "step1.upload.videos" }
/**
* | output |
* | --- |
* | "Max 500 MB / file" |
*
* @param {Step1_Upload_Maxsize1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_maxsize1 = /** @type {((inputs?: Step1_Upload_Maxsize1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Maxsize1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_maxsize1(inputs)
	return __cs.step1_upload_maxsize1(inputs)
});
export { step1_upload_maxsize1 as "step1.upload.maxSize" }
/**
* | output |
* | --- |
* | "Max 500 MB" |
*
* @param {Step1_Upload_Maxsizemobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_maxsizemobile2 = /** @type {((inputs?: Step1_Upload_Maxsizemobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Maxsizemobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_maxsizemobile2(inputs)
	return __cs.step1_upload_maxsizemobile2(inputs)
});
export { step1_upload_maxsizemobile2 as "step1.upload.maxSizeMobile" }
/**
* | output |
* | --- |
* | "Pending" |
*
* @param {Step1_Scan_PendingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_scan_pending = /** @type {((inputs?: Step1_Scan_PendingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Scan_PendingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_scan_pending(inputs)
	return __cs.step1_scan_pending(inputs)
});
export { step1_scan_pending as "step1.scan.pending" }
/**
* | output |
* | --- |
* | "Scanning" |
*
* @param {Step1_Scan_ScanningInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_scan_scanning = /** @type {((inputs?: Step1_Scan_ScanningInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Scan_ScanningInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_scan_scanning(inputs)
	return __cs.step1_scan_scanning(inputs)
});
export { step1_scan_scanning as "step1.scan.scanning" }
/**
* | output |
* | --- |
* | "Scanning {scanned}/{total} files..." |
*
* @param {Step1_Scan_ProgressInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_scan_progress = /** @type {((inputs: Step1_Scan_ProgressInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Scan_ProgressInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_scan_progress(inputs)
	return __cs.step1_scan_progress(inputs)
});
export { step1_scan_progress as "step1.scan.progress" }
/**
* | output |
* | --- |
* | "Files to process" |
*
* @param {Step1_Files_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_files_title = /** @type {((inputs?: Step1_Files_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Files_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_files_title(inputs)
	return __cs.step1_files_title(inputs)
});
export { step1_files_title as "step1.files.title" }
/**
* | output |
* | --- |
* | "Clear all" |
*
* @param {Step1_Files_Clearall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_files_clearall1 = /** @type {((inputs?: Step1_Files_Clearall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Files_Clearall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_files_clearall1(inputs)
	return __cs.step1_files_clearall1(inputs)
});
export { step1_files_clearall1 as "step1.files.clearAll" }
/**
* | output |
* | --- |
* | "Upload files to start cleaning metadata." |
*
* @param {Step1_Status_Uploadprompt1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_status_uploadprompt1 = /** @type {((inputs?: Step1_Status_Uploadprompt1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Status_Uploadprompt1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_status_uploadprompt1(inputs)
	return __cs.step1_status_uploadprompt1(inputs)
});
export { step1_status_uploadprompt1 as "step1.status.uploadPrompt" }
/**
* | output |
* | --- |
* | "MetaCleaner — Files Loaded" |
*
* @param {Step2_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_meta_title = /** @type {((inputs?: Step2_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_meta_title(inputs)
	return __cs.step2_meta_title(inputs)
});
export { step2_meta_title as "step2.meta.title" }
/**
* | output |
* | --- |
* | "Risk Scanner" |
*
* @param {Step2_Risk_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_title = /** @type {((inputs?: Step2_Risk_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_title(inputs)
	return __cs.step2_risk_title(inputs)
});
export { step2_risk_title as "step2.risk.title" }
/**
* | output |
* | --- |
* | "Risk Score" |
*
* @param {Step2_Risk_ScoreInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_score = /** @type {((inputs?: Step2_Risk_ScoreInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_ScoreInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_score(inputs)
	return __cs.step2_risk_score(inputs)
});
export { step2_risk_score as "step2.risk.score" }
/**
* | output |
* | --- |
* | "Personal data leak probable" |
*
* @param {Step2_Risk_Leakprobable1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_leakprobable1 = /** @type {((inputs?: Step2_Risk_Leakprobable1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Leakprobable1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_leakprobable1(inputs)
	return __cs.step2_risk_leakprobable1(inputs)
});
export { step2_risk_leakprobable1 as "step2.risk.leakProbable" }
/**
* | output |
* | --- |
* | "Your files contain sensitive metadata that may reveal your location, identity and device." |
*
* @param {Step2_Risk_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_description = /** @type {((inputs?: Step2_Risk_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_description(inputs)
	return __cs.step2_risk_description(inputs)
});
export { step2_risk_description as "step2.risk.description" }
/**
* | output |
* | --- |
* | "Risk analysis" |
*
* @param {Step2_Risk_Analysistitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_analysistitle1 = /** @type {((inputs?: Step2_Risk_Analysistitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Analysistitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_analysistitle1(inputs)
	return __cs.step2_risk_analysistitle1(inputs)
});
export { step2_risk_analysistitle1 as "step2.risk.analysisTitle" }
/**
* | output |
* | --- |
* | "GPS coordinates" |
*
* @param {Step2_Risk_Gpscoordinates1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_gpscoordinates1 = /** @type {((inputs?: Step2_Risk_Gpscoordinates1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Gpscoordinates1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_gpscoordinates1(inputs)
	return __cs.step2_risk_gpscoordinates1(inputs)
});
export { step2_risk_gpscoordinates1 as "step2.risk.gpsCoordinates" }
/**
* | output |
* | --- |
* | "Critical" |
*
* @param {Step2_Risk_CriticalInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_critical = /** @type {((inputs?: Step2_Risk_CriticalInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_CriticalInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_critical(inputs)
	return __cs.step2_risk_critical(inputs)
});
export { step2_risk_critical as "step2.risk.critical" }
/**
* | output |
* | --- |
* | "Device identity" |
*
* @param {Step2_Risk_Deviceidentity1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_deviceidentity1 = /** @type {((inputs?: Step2_Risk_Deviceidentity1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Deviceidentity1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_deviceidentity1(inputs)
	return __cs.step2_risk_deviceidentity1(inputs)
});
export { step2_risk_deviceidentity1 as "step2.risk.deviceIdentity" }
/**
* | output |
* | --- |
* | "High" |
*
* @param {Step2_Risk_HighInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_high = /** @type {((inputs?: Step2_Risk_HighInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_HighInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_high(inputs)
	return __cs.step2_risk_high(inputs)
});
export { step2_risk_high as "step2.risk.high" }
/**
* | output |
* | --- |
* | "Personal data" |
*
* @param {Step2_Risk_Personaldata1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_personaldata1 = /** @type {((inputs?: Step2_Risk_Personaldata1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Personaldata1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_personaldata1(inputs)
	return __cs.step2_risk_personaldata1(inputs)
});
export { step2_risk_personaldata1 as "step2.risk.personalData" }
/**
* | output |
* | --- |
* | "Medium" |
*
* @param {Step2_Risk_MediumInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_medium = /** @type {((inputs?: Step2_Risk_MediumInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_MediumInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_medium(inputs)
	return __cs.step2_risk_medium(inputs)
});
export { step2_risk_medium as "step2.risk.medium" }
/**
* | output |
* | --- |
* | "Timestamp" |
*
* @param {Step2_Risk_TimestampInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_timestamp = /** @type {((inputs?: Step2_Risk_TimestampInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_TimestampInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_timestamp(inputs)
	return __cs.step2_risk_timestamp(inputs)
});
export { step2_risk_timestamp as "step2.risk.timestamp" }
/**
* | output |
* | --- |
* | "Low" |
*
* @param {Step2_Risk_LowInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_low = /** @type {((inputs?: Step2_Risk_LowInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_LowInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_low(inputs)
	return __cs.step2_risk_low(inputs)
});
export { step2_risk_low as "step2.risk.low" }
/**
* | output |
* | --- |
* | "Now" |
*
* @param {Step2_Risk_NowInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_now = /** @type {((inputs?: Step2_Risk_NowInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_NowInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_now(inputs)
	return __cs.step2_risk_now(inputs)
});
export { step2_risk_now as "step2.risk.now" }
/**
* | output |
* | --- |
* | "After cleaning" |
*
* @param {Step2_Risk_Aftercleaning1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_aftercleaning1 = /** @type {((inputs?: Step2_Risk_Aftercleaning1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Aftercleaning1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_aftercleaning1(inputs)
	return __cs.step2_risk_aftercleaning1(inputs)
});
export { step2_risk_aftercleaning1 as "step2.risk.afterCleaning" }
/**
* | output |
* | --- |
* | "Clean Score" |
*
* @param {Step2_Risk_Cleanscore1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_cleanscore1 = /** @type {((inputs?: Step2_Risk_Cleanscore1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Cleanscore1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_cleanscore1(inputs)
	return __cs.step2_risk_cleanscore1(inputs)
});
export { step2_risk_cleanscore1 as "step2.risk.cleanScore" }
/**
* | output |
* | --- |
* | "Start cleaning and" |
*
* @param {Step2_Risk_Reducepre1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_reducepre1 = /** @type {((inputs?: Step2_Risk_Reducepre1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Reducepre1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_reducepre1(inputs)
	return __cs.step2_risk_reducepre1(inputs)
});
export { step2_risk_reducepre1 as "step2.risk.reducePre" }
/**
* | output |
* | --- |
* | "reduce risk to 0" |
*
* @param {Step2_Risk_Reducehighlight1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_reducehighlight1 = /** @type {((inputs?: Step2_Risk_Reducehighlight1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Reducehighlight1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_reducehighlight1(inputs)
	return __cs.step2_risk_reducehighlight1(inputs)
});
export { step2_risk_reducehighlight1 as "step2.risk.reduceHighlight" }
/**
* | output |
* | --- |
* | "AI-generated" |
*
* @param {Step2_Risk_Aiorigin1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_aiorigin1 = /** @type {((inputs?: Step2_Risk_Aiorigin1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Aiorigin1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_aiorigin1(inputs)
	return __cs.step2_risk_aiorigin1(inputs)
});
export { step2_risk_aiorigin1 as "step2.risk.aiOrigin" }
/**
* | output |
* | --- |
* | "AI" |
*
* @param {Step2_Risk_Chipai2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_chipai2 = /** @type {((inputs?: Step2_Risk_Chipai2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Chipai2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_chipai2(inputs)
	return __cs.step2_risk_chipai2(inputs)
});
export { step2_risk_chipai2 as "step2.risk.chipAI" }
/**
* | output |
* | --- |
* | "Device" |
*
* @param {Step2_Risk_Chipdevice1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_chipdevice1 = /** @type {((inputs?: Step2_Risk_Chipdevice1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Chipdevice1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_chipdevice1(inputs)
	return __cs.step2_risk_chipdevice1(inputs)
});
export { step2_risk_chipdevice1 as "step2.risk.chipDevice" }
/**
* | output |
* | --- |
* | "Personal" |
*
* @param {Step2_Risk_Chippersonal1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_chippersonal1 = /** @type {((inputs?: Step2_Risk_Chippersonal1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Chippersonal1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_chippersonal1(inputs)
	return __cs.step2_risk_chippersonal1(inputs)
});
export { step2_risk_chippersonal1 as "step2.risk.chipPersonal" }
/**
* | output |
* | --- |
* | "Add more files" |
*
* @param {Step2_Files_Addmore1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_addmore1 = /** @type {((inputs?: Step2_Files_Addmore1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Addmore1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_files_addmore1(inputs)
	return __cs.step2_files_addmore1(inputs)
});
export { step2_files_addmore1 as "step2.files.addMore" }
/**
* | output |
* | --- |
* | "{count} metadata fields" |
*
* @param {Step2_Files_Metadatafields1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_metadatafields1 = /** @type {((inputs: Step2_Files_Metadatafields1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Metadatafields1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_files_metadatafields1(inputs)
	return __cs.step2_files_metadatafields1(inputs)
});
export { step2_files_metadatafields1 as "step2.files.metadataFields" }
/**
* | output |
* | --- |
* | "{count} fields" |
*
* @param {Step2_Files_Metadatafieldsmobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_metadatafieldsmobile2 = /** @type {((inputs: Step2_Files_Metadatafieldsmobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Metadatafieldsmobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_files_metadatafieldsmobile2(inputs)
	return __cs.step2_files_metadatafieldsmobile2(inputs)
});
export { step2_files_metadatafieldsmobile2 as "step2.files.metadataFieldsMobile" }
/**
* | output |
* | --- |
* | "GPS found" |
*
* @param {Step2_Files_Gpsfound1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_gpsfound1 = /** @type {((inputs?: Step2_Files_Gpsfound1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Gpsfound1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_files_gpsfound1(inputs)
	return __cs.step2_files_gpsfound1(inputs)
});
export { step2_files_gpsfound1 as "step2.files.gpsFound" }
/**
* | output |
* | --- |
* | "AI-generated" |
*
* @param {Step2_Files_Aigenerated1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_aigenerated1 = /** @type {((inputs?: Step2_Files_Aigenerated1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Aigenerated1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_files_aigenerated1(inputs)
	return __cs.step2_files_aigenerated1(inputs)
});
export { step2_files_aigenerated1 as "step2.files.aiGenerated" }
/**
* | output |
* | --- |
* | "Could not scan" |
*
* @param {Step2_Files_Scanerror1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_files_scanerror1 = /** @type {((inputs?: Step2_Files_Scanerror1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Files_Scanerror1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_files_scanerror1(inputs)
	return __cs.step2_files_scanerror1(inputs)
});
export { step2_files_scanerror1 as "step2.files.scanError" }
/**
* | output |
* | --- |
* | "Scanning failed" |
*
* @param {Step2_Risk_Scanfailed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_scanfailed1 = /** @type {((inputs?: Step2_Risk_Scanfailed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Scanfailed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_scanfailed1(inputs)
	return __cs.step2_risk_scanfailed1(inputs)
});
export { step2_risk_scanfailed1 as "step2.risk.scanFailed" }
/**
* | output |
* | --- |
* | "Could not analyze the uploaded files. Remove them and try again." |
*
* @param {Step2_Risk_Scanfaileddesc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_scanfaileddesc2 = /** @type {((inputs?: Step2_Risk_Scanfaileddesc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Scanfaileddesc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_scanfaileddesc2(inputs)
	return __cs.step2_risk_scanfaileddesc2(inputs)
});
export { step2_risk_scanfaileddesc2 as "step2.risk.scanFailedDesc" }
/**
* | output |
* | --- |
* | "MetaCleaner — Processing" |
*
* @param {Step3_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_meta_title = /** @type {((inputs?: Step3_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_meta_title(inputs)
	return __cs.step3_meta_title(inputs)
});
export { step3_meta_title as "step3.meta.title" }
/**
* | output |
* | --- |
* | "Cleaning in progress..." |
*
* @param {Step3_Badge_Inprogressdesktop2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_badge_inprogressdesktop2 = /** @type {((inputs?: Step3_Badge_Inprogressdesktop2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Badge_Inprogressdesktop2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_badge_inprogressdesktop2(inputs)
	return __cs.step3_badge_inprogressdesktop2(inputs)
});
export { step3_badge_inprogressdesktop2 as "step3.badge.inProgressDesktop" }
/**
* | output |
* | --- |
* | "In progress..." |
*
* @param {Step3_Badge_Inprogressmobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_badge_inprogressmobile2 = /** @type {((inputs?: Step3_Badge_Inprogressmobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Badge_Inprogressmobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_badge_inprogressmobile2(inputs)
	return __cs.step3_badge_inprogressmobile2(inputs)
});
export { step3_badge_inprogressmobile2 as "step3.badge.inProgressMobile" }
/**
* | output |
* | --- |
* | "Processing status" |
*
* @param {Step3_Status_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_status_title = /** @type {((inputs?: Step3_Status_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Status_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_status_title(inputs)
	return __cs.step3_status_title(inputs)
});
export { step3_status_title as "step3.status.title" }
/**
* | output |
* | --- |
* | "In progress" |
*
* @param {Step3_Status_Inprogress1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_status_inprogress1 = /** @type {((inputs?: Step3_Status_Inprogress1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Status_Inprogress1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_status_inprogress1(inputs)
	return __cs.step3_status_inprogress1(inputs)
});
export { step3_status_inprogress1 as "step3.status.inProgress" }
/**
* | output |
* | --- |
* | "Metadata cleaning in progress" |
*
* @param {Step3_Status_Cleaninginprogress2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_status_cleaninginprogress2 = /** @type {((inputs?: Step3_Status_Cleaninginprogress2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Status_Cleaninginprogress2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_status_cleaninginprogress2(inputs)
	return __cs.step3_status_cleaninginprogress2(inputs)
});
export { step3_status_cleaninginprogress2 as "step3.status.cleaningInProgress" }
/**
* | output |
* | --- |
* | "Processing..." |
*
* @param {Step3_Status_ProcessingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_status_processing = /** @type {((inputs?: Step3_Status_ProcessingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Status_ProcessingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_status_processing(inputs)
	return __cs.step3_status_processing(inputs)
});
export { step3_status_processing as "step3.status.processing" }
/**
* | output |
* | --- |
* | "Overall progress" |
*
* @param {Step3_Progress_OverallInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_progress_overall = /** @type {((inputs?: Step3_Progress_OverallInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Progress_OverallInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_progress_overall(inputs)
	return __cs.step3_progress_overall(inputs)
});
export { step3_progress_overall as "step3.progress.overall" }
/**
* | output |
* | --- |
* | "{done} of {total} files completed" |
*
* @param {Step3_Progress_Filescompleted1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_progress_filescompleted1 = /** @type {((inputs: Step3_Progress_Filescompleted1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Progress_Filescompleted1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_progress_filescompleted1(inputs)
	return __cs.step3_progress_filescompleted1(inputs)
});
export { step3_progress_filescompleted1 as "step3.progress.filesCompleted" }
/**
* | output |
* | --- |
* | "~{time} remaining" |
*
* @param {Step3_Progress_Timeremaining1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_progress_timeremaining1 = /** @type {((inputs: Step3_Progress_Timeremaining1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Progress_Timeremaining1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_progress_timeremaining1(inputs)
	return __cs.step3_progress_timeremaining1(inputs)
});
export { step3_progress_timeremaining1 as "step3.progress.timeRemaining" }
/**
* | output |
* | --- |
* | "fields removed" |
*
* @param {Step3_Files_Fieldsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_files_fieldsremoved1 = /** @type {((inputs?: Step3_Files_Fieldsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Files_Fieldsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_files_fieldsremoved1(inputs)
	return __cs.step3_files_fieldsremoved1(inputs)
});
export { step3_files_fieldsremoved1 as "step3.files.fieldsRemoved" }
/**
* | output |
* | --- |
* | "GPS + {count} fields removed" |
*
* @param {Step3_Files_Gpsandfieldsremoved3Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_files_gpsandfieldsremoved3 = /** @type {((inputs: Step3_Files_Gpsandfieldsremoved3Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Files_Gpsandfieldsremoved3Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_files_gpsandfieldsremoved3(inputs)
	return __cs.step3_files_gpsandfieldsremoved3(inputs)
});
export { step3_files_gpsandfieldsremoved3 as "step3.files.gpsAndFieldsRemoved" }
/**
* | output |
* | --- |
* | "GPS + {count} fields" |
*
* @param {Step3_Files_Gpsandfieldsremovedmobile4Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_files_gpsandfieldsremovedmobile4 = /** @type {((inputs: Step3_Files_Gpsandfieldsremovedmobile4Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Files_Gpsandfieldsremovedmobile4Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_files_gpsandfieldsremovedmobile4(inputs)
	return __cs.step3_files_gpsandfieldsremovedmobile4(inputs)
});
export { step3_files_gpsandfieldsremovedmobile4 as "step3.files.gpsAndFieldsRemovedMobile" }
/**
* | output |
* | --- |
* | "Processing..." |
*
* @param {Step3_Files_ProcessingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_files_processing = /** @type {((inputs?: Step3_Files_ProcessingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Files_ProcessingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_files_processing(inputs)
	return __cs.step3_files_processing(inputs)
});
export { step3_files_processing as "step3.files.processing" }
/**
* | output |
* | --- |
* | "Waiting in queue" |
*
* @param {Step3_Files_Waitinginqueue2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_files_waitinginqueue2 = /** @type {((inputs?: Step3_Files_Waitinginqueue2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Files_Waitinginqueue2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_files_waitinginqueue2(inputs)
	return __cs.step3_files_waitinginqueue2(inputs)
});
export { step3_files_waitinginqueue2 as "step3.files.waitingInQueue" }
/**
* | output |
* | --- |
* | "Fields deleted" |
*
* @param {Step3_Stats_Fieldsdeleted1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_stats_fieldsdeleted1 = /** @type {((inputs?: Step3_Stats_Fieldsdeleted1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Stats_Fieldsdeleted1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_stats_fieldsdeleted1(inputs)
	return __cs.step3_stats_fieldsdeleted1(inputs)
});
export { step3_stats_fieldsdeleted1 as "step3.stats.fieldsDeleted" }
/**
* | output |
* | --- |
* | "Done" |
*
* @param {Step3_Stats_DoneInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_stats_done = /** @type {((inputs?: Step3_Stats_DoneInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Stats_DoneInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_stats_done(inputs)
	return __cs.step3_stats_done(inputs)
});
export { step3_stats_done as "step3.stats.done" }
/**
* | output |
* | --- |
* | "Processing file {filename}" |
*
* @param {Step3_Status_Processingfilelong2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_status_processingfilelong2 = /** @type {((inputs: Step3_Status_Processingfilelong2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Status_Processingfilelong2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_status_processingfilelong2(inputs)
	return __cs.step3_status_processingfilelong2(inputs)
});
export { step3_status_processingfilelong2 as "step3.status.processingFileLong" }
/**
* | output |
* | --- |
* | "Stop" |
*
* @param {Step3_Actions_StopInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_actions_stop = /** @type {((inputs?: Step3_Actions_StopInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Actions_StopInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_actions_stop(inputs)
	return __cs.step3_actions_stop(inputs)
});
export { step3_actions_stop as "step3.actions.stop" }
/**
* | output |
* | --- |
* | "Activity log" |
*
* @param {Step3_Log_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_log_title = /** @type {((inputs?: Step3_Log_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Log_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_log_title(inputs)
	return __cs.step3_log_title(inputs)
});
export { step3_log_title as "step3.log.title" }
/**
* | output |
* | --- |
* | "GPS coordinates + {count} fields removed" |
*
* @param {Step3_Log_Gpssuccess1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_log_gpssuccess1 = /** @type {((inputs: Step3_Log_Gpssuccess1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Log_Gpssuccess1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_log_gpssuccess1(inputs)
	return __cs.step3_log_gpssuccess1(inputs)
});
export { step3_log_gpssuccess1 as "step3.log.gpsSuccess" }
/**
* | output |
* | --- |
* | "processing ({pct}%)..." |
*
* @param {Step3_Log_Inprogress1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_log_inprogress1 = /** @type {((inputs: Step3_Log_Inprogress1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Log_Inprogress1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_log_inprogress1(inputs)
	return __cs.step3_log_inprogress1(inputs)
});
export { step3_log_inprogress1 as "step3.log.inProgress" }
/**
* | output |
* | --- |
* | "waiting in queue" |
*
* @param {Step3_Log_WaitingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step3_log_waiting = /** @type {((inputs?: Step3_Log_WaitingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step3_Log_WaitingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step3_log_waiting(inputs)
	return __cs.step3_log_waiting(inputs)
});
export { step3_log_waiting as "step3.log.waiting" }
/**
* | output |
* | --- |
* | "MetaCleaner — Processing Error" |
*
* @param {Step4_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_meta_title = /** @type {((inputs?: Step4_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_meta_title(inputs)
	return __cs.step4_meta_title(inputs)
});
export { step4_meta_title as "step4.meta.title" }
/**
* | output |
* | --- |
* | "Processing error" |
*
* @param {Step4_Badge_Errordesktop1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_badge_errordesktop1 = /** @type {((inputs?: Step4_Badge_Errordesktop1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Badge_Errordesktop1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_badge_errordesktop1(inputs)
	return __cs.step4_badge_errordesktop1(inputs)
});
export { step4_badge_errordesktop1 as "step4.badge.errorDesktop" }
/**
* | output |
* | --- |
* | "Error" |
*
* @param {Step4_Badge_Errormobile1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_badge_errormobile1 = /** @type {((inputs?: Step4_Badge_Errormobile1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Badge_Errormobile1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_badge_errormobile1(inputs)
	return __cs.step4_badge_errormobile1(inputs)
});
export { step4_badge_errormobile1 as "step4.badge.errorMobile" }
/**
* | output |
* | --- |
* | "Cleaning process failed" |
*
* @param {Step4_Error_Processfailedtitle2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_processfailedtitle2 = /** @type {((inputs?: Step4_Error_Processfailedtitle2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Processfailedtitle2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_error_processfailedtitle2(inputs)
	return __cs.step4_error_processfailedtitle2(inputs)
});
export { step4_error_processfailedtitle2 as "step4.error.processFailedTitle" }
/**
* | output |
* | --- |
* | "An unexpected error occurred while processing the files. Some files could not be cleaned." |
*
* @param {Step4_Error_Descriptiondesktop1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_descriptiondesktop1 = /** @type {((inputs?: Step4_Error_Descriptiondesktop1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Descriptiondesktop1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_error_descriptiondesktop1(inputs)
	return __cs.step4_error_descriptiondesktop1(inputs)
});
export { step4_error_descriptiondesktop1 as "step4.error.descriptionDesktop" }
/**
* | output |
* | --- |
* | "Metadata cleaning failed" |
*
* @param {Step4_Error_Cleaningfailed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_cleaningfailed1 = /** @type {((inputs?: Step4_Error_Cleaningfailed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Cleaningfailed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_error_cleaningfailed1(inputs)
	return __cs.step4_error_cleaningfailed1(inputs)
});
export { step4_error_cleaningfailed1 as "step4.error.cleaningFailed" }
/**
* | output |
* | --- |
* | "could not be processed" |
*
* @param {Step4_Error_Couldnotprocess2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_couldnotprocess2 = /** @type {((inputs?: Step4_Error_Couldnotprocess2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Couldnotprocess2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_error_couldnotprocess2(inputs)
	return __cs.step4_error_couldnotprocess2(inputs)
});
export { step4_error_couldnotprocess2 as "step4.error.couldNotProcess" }
/**
* | output |
* | --- |
* | "Interrupted" |
*
* @param {Step4_Error_InterruptedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_interrupted = /** @type {((inputs?: Step4_Error_InterruptedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_InterruptedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_error_interrupted(inputs)
	return __cs.step4_error_interrupted(inputs)
});
export { step4_error_interrupted as "step4.error.interrupted" }
/**
* | output |
* | --- |
* | "Processing failed" |
*
* @param {Step4_Error_Processingfailed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_processingfailed1 = /** @type {((inputs?: Step4_Error_Processingfailed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Processingfailed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_error_processingfailed1(inputs)
	return __cs.step4_error_processingfailed1(inputs)
});
export { step4_error_processingfailed1 as "step4.error.processingFailed" }
/**
* | output |
* | --- |
* | "Failed" |
*
* @param {Step4_Error_Failedshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_failedshort1 = /** @type {((inputs?: Step4_Error_Failedshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_Failedshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_error_failedshort1(inputs)
	return __cs.step4_error_failedshort1(inputs)
});
export { step4_error_failedshort1 as "step4.error.failedShort" }
/**
* | output |
* | --- |
* | "Skipped" |
*
* @param {Step4_Error_SkippedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_error_skipped = /** @type {((inputs?: Step4_Error_SkippedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Error_SkippedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_error_skipped(inputs)
	return __cs.step4_error_skipped(inputs)
});
export { step4_error_skipped as "step4.error.skipped" }
/**
* | output |
* | --- |
* | "Error detail" |
*
* @param {Step4_Detail_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_title = /** @type {((inputs?: Step4_Detail_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_detail_title(inputs)
	return __cs.step4_detail_title(inputs)
});
export { step4_detail_title as "step4.detail.title" }
/**
* | output |
* | --- |
* | "Cleaning process interrupted due to internal error. Please check the error details and try again." |
*
* @param {Step4_Detail_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_description = /** @type {((inputs?: Step4_Detail_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_detail_description(inputs)
	return __cs.step4_detail_description(inputs)
});
export { step4_detail_description as "step4.detail.description" }
/**
* | output |
* | --- |
* | "Error code" |
*
* @param {Step4_Detail_Errorcode1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_errorcode1 = /** @type {((inputs?: Step4_Detail_Errorcode1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_Errorcode1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_detail_errorcode1(inputs)
	return __cs.step4_detail_errorcode1(inputs)
});
export { step4_detail_errorcode1 as "step4.detail.errorCode" }
/**
* | output |
* | --- |
* | "Time of occurrence" |
*
* @param {Step4_Detail_Errortime1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_errortime1 = /** @type {((inputs?: Step4_Detail_Errortime1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_Errortime1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_detail_errortime1(inputs)
	return __cs.step4_detail_errortime1(inputs)
});
export { step4_detail_errortime1 as "step4.detail.errorTime" }
/**
* | output |
* | --- |
* | "File" |
*
* @param {Step4_Detail_FileInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_file = /** @type {((inputs?: Step4_Detail_FileInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_FileInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_detail_file(inputs)
	return __cs.step4_detail_file(inputs)
});
export { step4_detail_file as "step4.detail.file" }
/**
* | output |
* | --- |
* | "Phase" |
*
* @param {Step4_Detail_PhaseInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_detail_phase = /** @type {((inputs?: Step4_Detail_PhaseInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Detail_PhaseInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_detail_phase(inputs)
	return __cs.step4_detail_phase(inputs)
});
export { step4_detail_phase as "step4.detail.phase" }
/**
* | output |
* | --- |
* | "Error type" |
*
* @param {Step4_Type_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_title = /** @type {((inputs?: Step4_Type_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_type_title(inputs)
	return __cs.step4_type_title(inputs)
});
export { step4_type_title as "step4.type.title" }
/**
* | output |
* | --- |
* | "Cleaning error" |
*
* @param {Step4_Type_Cleaning_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_cleaning_title = /** @type {((inputs?: Step4_Type_Cleaning_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Cleaning_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_type_cleaning_title(inputs)
	return __cs.step4_type_cleaning_title(inputs)
});
export { step4_type_cleaning_title as "step4.type.cleaning.title" }
/**
* | output |
* | --- |
* | "Metadata could not be completely removed from one or more files." |
*
* @param {Step4_Type_Cleaning_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_cleaning_description = /** @type {((inputs?: Step4_Type_Cleaning_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Cleaning_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_type_cleaning_description(inputs)
	return __cs.step4_type_cleaning_description(inputs)
});
export { step4_type_cleaning_description as "step4.type.cleaning.description" }
/**
* | output |
* | --- |
* | "Connection error" |
*
* @param {Step4_Type_Connection_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_connection_title = /** @type {((inputs?: Step4_Type_Connection_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Connection_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_type_connection_title(inputs)
	return __cs.step4_type_connection_title(inputs)
});
export { step4_type_connection_title as "step4.type.connection.title" }
/**
* | output |
* | --- |
* | "Communication with the processing service was interrupted." |
*
* @param {Step4_Type_Connection_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_connection_description = /** @type {((inputs?: Step4_Type_Connection_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Connection_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_type_connection_description(inputs)
	return __cs.step4_type_connection_description(inputs)
});
export { step4_type_connection_description as "step4.type.connection.description" }
/**
* | output |
* | --- |
* | "Timeout" |
*
* @param {Step4_Type_Timeout_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_timeout_title = /** @type {((inputs?: Step4_Type_Timeout_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Timeout_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_type_timeout_title(inputs)
	return __cs.step4_type_timeout_title(inputs)
});
export { step4_type_timeout_title as "step4.type.timeout.title" }
/**
* | output |
* | --- |
* | "Processing exceeded the time limit." |
*
* @param {Step4_Type_Timeout_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_type_timeout_description = /** @type {((inputs?: Step4_Type_Timeout_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Type_Timeout_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_type_timeout_description(inputs)
	return __cs.step4_type_timeout_description(inputs)
});
export { step4_type_timeout_description as "step4.type.timeout.description" }
/**
* | output |
* | --- |
* | "Error log" |
*
* @param {Step4_Log_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_log_title = /** @type {((inputs?: Step4_Log_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Log_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_log_title(inputs)
	return __cs.step4_log_title(inputs)
});
export { step4_log_title as "step4.log.title" }
/**
* | output |
* | --- |
* | "Try again" |
*
* @param {Step4_Actions_Tryagain1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_actions_tryagain1 = /** @type {((inputs?: Step4_Actions_Tryagain1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Actions_Tryagain1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_actions_tryagain1(inputs)
	return __cs.step4_actions_tryagain1(inputs)
});
export { step4_actions_tryagain1 as "step4.actions.tryAgain" }
/**
* | output |
* | --- |
* | "Clear all" |
*
* @param {Step4_Actions_Clearall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step4_actions_clearall1 = /** @type {((inputs?: Step4_Actions_Clearall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step4_Actions_Clearall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step4_actions_clearall1(inputs)
	return __cs.step4_actions_clearall1(inputs)
});
export { step4_actions_clearall1 as "step4.actions.clearAll" }
/**
* | output |
* | --- |
* | "MetaCleaner — Cleaning Complete" |
*
* @param {Step5_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_meta_title = /** @type {((inputs?: Step5_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_meta_title(inputs)
	return __cs.step5_meta_title(inputs)
});
export { step5_meta_title as "step5.meta.title" }
/**
* | output |
* | --- |
* | "Cleaning complete!" |
*
* @param {Step5_Header_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_header_title = /** @type {((inputs?: Step5_Header_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Header_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_header_title(inputs)
	return __cs.step5_header_title(inputs)
});
export { step5_header_title as "step5.header.title" }
/**
* | output |
* | --- |
* | "All metadata successfully removed from {count} files." |
*
* @param {Step5_Header_Descriptiondesktop1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_header_descriptiondesktop1 = /** @type {((inputs: Step5_Header_Descriptiondesktop1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Header_Descriptiondesktop1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_header_descriptiondesktop1(inputs)
	return __cs.step5_header_descriptiondesktop1(inputs)
});
export { step5_header_descriptiondesktop1 as "step5.header.descriptionDesktop" }
/**
* | output |
* | --- |
* | "All metadata removed from {count} files." |
*
* @param {Step5_Header_Descriptionmobile1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_header_descriptionmobile1 = /** @type {((inputs: Step5_Header_Descriptionmobile1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Header_Descriptionmobile1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_header_descriptionmobile1(inputs)
	return __cs.step5_header_descriptionmobile1(inputs)
});
export { step5_header_descriptionmobile1 as "step5.header.descriptionMobile" }
/**
* | output |
* | --- |
* | "Upload new files" |
*
* @param {Step5_Actions_Uploadnew1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_actions_uploadnew1 = /** @type {((inputs?: Step5_Actions_Uploadnew1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Actions_Uploadnew1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_actions_uploadnew1(inputs)
	return __cs.step5_actions_uploadnew1(inputs)
});
export { step5_actions_uploadnew1 as "step5.actions.uploadNew" }
/**
* | output |
* | --- |
* | "100% Successfully completed" |
*
* @param {Step5_Badge_SuccessInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_badge_success = /** @type {((inputs?: Step5_Badge_SuccessInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Badge_SuccessInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_badge_success(inputs)
	return __cs.step5_badge_success(inputs)
});
export { step5_badge_success as "step5.badge.success" }
/**
* | output |
* | --- |
* | "Files processed" |
*
* @param {Step5_Stats_Filesprocessed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_stats_filesprocessed1 = /** @type {((inputs?: Step5_Stats_Filesprocessed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Stats_Filesprocessed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_stats_filesprocessed1(inputs)
	return __cs.step5_stats_filesprocessed1(inputs)
});
export { step5_stats_filesprocessed1 as "step5.stats.filesProcessed" }
/**
* | output |
* | --- |
* | "Metadata fields removed" |
*
* @param {Step5_Stats_Fieldsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_stats_fieldsremoved1 = /** @type {((inputs?: Step5_Stats_Fieldsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Stats_Fieldsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_stats_fieldsremoved1(inputs)
	return __cs.step5_stats_fieldsremoved1(inputs)
});
export { step5_stats_fieldsremoved1 as "step5.stats.fieldsRemoved" }
/**
* | output |
* | --- |
* | "GPS locations removed" |
*
* @param {Step5_Stats_Gpsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_stats_gpsremoved1 = /** @type {((inputs?: Step5_Stats_Gpsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Stats_Gpsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_stats_gpsremoved1(inputs)
	return __cs.step5_stats_gpsremoved1(inputs)
});
export { step5_stats_gpsremoved1 as "step5.stats.gpsRemoved" }
/**
* | output |
* | --- |
* | "Total cleaning time" |
*
* @param {Step5_Stats_Totaltime1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_stats_totaltime1 = /** @type {((inputs?: Step5_Stats_Totaltime1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Stats_Totaltime1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_stats_totaltime1(inputs)
	return __cs.step5_stats_totaltime1(inputs)
});
export { step5_stats_totaltime1 as "step5.stats.totalTime" }
/**
* | output |
* | --- |
* | "Metadata overview" |
*
* @param {Step5_Metadata_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_title = /** @type {((inputs?: Step5_Metadata_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_title(inputs)
	return __cs.step5_metadata_title(inputs)
});
export { step5_metadata_title as "step5.metadata.title" }
/**
* | output |
* | --- |
* | "Before cleaning" |
*
* @param {Step5_Metadata_BeforeInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_before = /** @type {((inputs?: Step5_Metadata_BeforeInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_BeforeInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_before(inputs)
	return __cs.step5_metadata_before(inputs)
});
export { step5_metadata_before as "step5.metadata.before" }
/**
* | output |
* | --- |
* | "After cleaning" |
*
* @param {Step5_Metadata_AfterInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_after = /** @type {((inputs?: Step5_Metadata_AfterInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_AfterInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_after(inputs)
	return __cs.step5_metadata_after(inputs)
});
export { step5_metadata_after as "step5.metadata.after" }
/**
* | output |
* | --- |
* | "Files contained hidden data" |
*
* @param {Step5_Metadata_Beforedesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_beforedesc1 = /** @type {((inputs?: Step5_Metadata_Beforedesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Beforedesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_beforedesc1(inputs)
	return __cs.step5_metadata_beforedesc1(inputs)
});
export { step5_metadata_beforedesc1 as "step5.metadata.beforeDesc" }
/**
* | output |
* | --- |
* | "Files are safe to share" |
*
* @param {Step5_Metadata_Afterdesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_afterdesc1 = /** @type {((inputs?: Step5_Metadata_Afterdesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Afterdesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_afterdesc1(inputs)
	return __cs.step5_metadata_afterdesc1(inputs)
});
export { step5_metadata_afterdesc1 as "step5.metadata.afterDesc" }
/**
* | output |
* | --- |
* | "GPS coordinates" |
*
* @param {Step5_Metadata_GpsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_gps = /** @type {((inputs?: Step5_Metadata_GpsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_GpsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_gps(inputs)
	return __cs.step5_metadata_gps(inputs)
});
export { step5_metadata_gps as "step5.metadata.gps" }
/**
* | output |
* | --- |
* | "EXIF data" |
*
* @param {Step5_Metadata_ExifInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_exif = /** @type {((inputs?: Step5_Metadata_ExifInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_ExifInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_exif(inputs)
	return __cs.step5_metadata_exif(inputs)
});
export { step5_metadata_exif as "step5.metadata.exif" }
/**
* | output |
* | --- |
* | "XMP/IPTC" |
*
* @param {Step5_Metadata_XmpInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_xmp = /** @type {((inputs?: Step5_Metadata_XmpInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_XmpInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_xmp(inputs)
	return __cs.step5_metadata_xmp(inputs)
});
export { step5_metadata_xmp as "step5.metadata.xmp" }
/**
* | output |
* | --- |
* | "Other" |
*
* @param {Step5_Metadata_OtherInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_other = /** @type {((inputs?: Step5_Metadata_OtherInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_OtherInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_other(inputs)
	return __cs.step5_metadata_other(inputs)
});
export { step5_metadata_other as "step5.metadata.other" }
/**
* | output |
* | --- |
* | "Removed" |
*
* @param {Step5_Metadata_RemovedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_removed = /** @type {((inputs?: Step5_Metadata_RemovedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_RemovedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_removed(inputs)
	return __cs.step5_metadata_removed(inputs)
});
export { step5_metadata_removed as "step5.metadata.removed" }
/**
* | output |
* | --- |
* | "{count} metadata fields were exposed." |
*
* @param {Step5_Metadata_Totalexposed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_totalexposed1 = /** @type {((inputs: Step5_Metadata_Totalexposed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Totalexposed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_totalexposed1(inputs)
	return __cs.step5_metadata_totalexposed1(inputs)
});
export { step5_metadata_totalexposed1 as "step5.metadata.totalExposed" }
/**
* | output |
* | --- |
* | "Files contain no sensitive metadata." |
*
* @param {Step5_Metadata_Allclean1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_allclean1 = /** @type {((inputs?: Step5_Metadata_Allclean1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Allclean1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_allclean1(inputs)
	return __cs.step5_metadata_allclean1(inputs)
});
export { step5_metadata_allclean1 as "step5.metadata.allClean" }
/**
* | output |
* | --- |
* | "High privacy leak risk! {count} metadata fields were exposed." |
*
* @param {Step5_Metadata_Highriskwarning2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_highriskwarning2 = /** @type {((inputs: Step5_Metadata_Highriskwarning2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Highriskwarning2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_highriskwarning2(inputs)
	return __cs.step5_metadata_highriskwarning2(inputs)
});
export { step5_metadata_highriskwarning2 as "step5.metadata.highRiskWarning" }
/**
* | output |
* | --- |
* | "{count} files" |
*
* @param {Step5_Metadata_Filescount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_filescount1 = /** @type {((inputs: Step5_Metadata_Filescount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Filescount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_filescount1(inputs)
	return __cs.step5_metadata_filescount1(inputs)
});
export { step5_metadata_filescount1 as "step5.metadata.filesCount" }
/**
* | output |
* | --- |
* | "{count} fields" |
*
* @param {Step5_Metadata_Fieldscount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_fieldscount1 = /** @type {((inputs: Step5_Metadata_Fieldscount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Fieldscount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_fieldscount1(inputs)
	return __cs.step5_metadata_fieldscount1(inputs)
});
export { step5_metadata_fieldscount1 as "step5.metadata.fieldsCount" }
/**
* | output |
* | --- |
* | "All sensitive metadata has been successfully removed." |
*
* @param {Step5_Metadata_Allremovedsuccess2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_allremovedsuccess2 = /** @type {((inputs?: Step5_Metadata_Allremovedsuccess2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Allremovedsuccess2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_allremovedsuccess2(inputs)
	return __cs.step5_metadata_allremovedsuccess2(inputs)
});
export { step5_metadata_allremovedsuccess2 as "step5.metadata.allRemovedSuccess" }
/**
* | output |
* | --- |
* | "Total risk" |
*
* @param {Step5_Metadata_Totalrisk1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_totalrisk1 = /** @type {((inputs?: Step5_Metadata_Totalrisk1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Totalrisk1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_totalrisk1(inputs)
	return __cs.step5_metadata_totalrisk1(inputs)
});
export { step5_metadata_totalrisk1 as "step5.metadata.totalRisk" }
/**
* | output |
* | --- |
* | "High" |
*
* @param {Step5_Metadata_Riskhigh1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_riskhigh1 = /** @type {((inputs?: Step5_Metadata_Riskhigh1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Riskhigh1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_riskhigh1(inputs)
	return __cs.step5_metadata_riskhigh1(inputs)
});
export { step5_metadata_riskhigh1 as "step5.metadata.riskHigh" }
/**
* | output |
* | --- |
* | "None" |
*
* @param {Step5_Metadata_Risknone1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_risknone1 = /** @type {((inputs?: Step5_Metadata_Risknone1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Risknone1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_risknone1(inputs)
	return __cs.step5_metadata_risknone1(inputs)
});
export { step5_metadata_risknone1 as "step5.metadata.riskNone" }
/**
* | output |
* | --- |
* | "ID3 / MP4 atoms" |
*
* @param {Step5_Metadata_Id3mp4Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_metadata_id3mp4 = /** @type {((inputs?: Step5_Metadata_Id3mp4Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Metadata_Id3mp4Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_metadata_id3mp4(inputs)
	return __cs.step5_metadata_id3mp4(inputs)
});
export { step5_metadata_id3mp4 as "step5.metadata.id3mp4" }
/**
* | output |
* | --- |
* | "File results" |
*
* @param {Step5_Results_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_results_title = /** @type {((inputs?: Step5_Results_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Results_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_results_title(inputs)
	return __cs.step5_results_title(inputs)
});
export { step5_results_title as "step5.results.title" }
/**
* | output |
* | --- |
* | "All done" |
*
* @param {Step5_Results_Alldone1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_results_alldone1 = /** @type {((inputs?: Step5_Results_Alldone1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Results_Alldone1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_results_alldone1(inputs)
	return __cs.step5_results_alldone1(inputs)
});
export { step5_results_alldone1 as "step5.results.allDone" }
/**
* | output |
* | --- |
* | "GPS removed" |
*
* @param {Step5_Results_Gpsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_results_gpsremoved1 = /** @type {((inputs?: Step5_Results_Gpsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Results_Gpsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_results_gpsremoved1(inputs)
	return __cs.step5_results_gpsremoved1(inputs)
});
export { step5_results_gpsremoved1 as "step5.results.gpsRemoved" }
/**
* | output |
* | --- |
* | "{count} fields removed" |
*
* @param {Step5_Results_Fieldscount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_results_fieldscount1 = /** @type {((inputs: Step5_Results_Fieldscount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Results_Fieldscount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_results_fieldscount1(inputs)
	return __cs.step5_results_fieldscount1(inputs)
});
export { step5_results_fieldscount1 as "step5.results.fieldsCount" }
/**
* | output |
* | --- |
* | "Download all (ZIP)" |
*
* @param {Step5_Actions_Downloadall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_actions_downloadall1 = /** @type {((inputs?: Step5_Actions_Downloadall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Actions_Downloadall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_actions_downloadall1(inputs)
	return __cs.step5_actions_downloadall1(inputs)
});
export { step5_actions_downloadall1 as "step5.actions.downloadAll" }
/**
* | output |
* | --- |
* | "View report" |
*
* @param {Step5_Actions_Viewreport1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step5_actions_viewreport1 = /** @type {((inputs?: Step5_Actions_Viewreport1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step5_Actions_Viewreport1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step5_actions_viewreport1(inputs)
	return __cs.step5_actions_viewreport1(inputs)
});
export { step5_actions_viewreport1 as "step5.actions.viewReport" }
/**
* | output |
* | --- |
* | "MetaCleaner — Report History" |
*
* @param {Reports_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_meta_title = /** @type {((inputs?: Reports_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_meta_title(inputs)
	return __cs.reports_meta_title(inputs)
});
export { reports_meta_title as "reports.meta.title" }
/**
* | output |
* | --- |
* | "Report history" |
*
* @param {Reports_Header_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_title = /** @type {((inputs?: Reports_Header_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_header_title(inputs)
	return __cs.reports_header_title(inputs)
});
export { reports_header_title as "reports.header.title" }
/**
* | output |
* | --- |
* | "Log of all cleaning operations" |
*
* @param {Reports_Header_SubtitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_subtitle = /** @type {((inputs?: Reports_Header_SubtitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_SubtitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_header_subtitle(inputs)
	return __cs.reports_header_subtitle(inputs)
});
export { reports_header_subtitle as "reports.header.subtitle" }
/**
* | output |
* | --- |
* | "{count} reports total" |
*
* @param {Reports_Header_Totalreports1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_totalreports1 = /** @type {((inputs: Reports_Header_Totalreports1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_Totalreports1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_header_totalreports1(inputs)
	return __cs.reports_header_totalreports1(inputs)
});
export { reports_header_totalreports1 as "reports.header.totalReports" }
/**
* | output |
* | --- |
* | "New cleaning" |
*
* @param {Reports_Header_Newcleaning1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_newcleaning1 = /** @type {((inputs?: Reports_Header_Newcleaning1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_Newcleaning1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_header_newcleaning1(inputs)
	return __cs.reports_header_newcleaning1(inputs)
});
export { reports_header_newcleaning1 as "reports.header.newCleaning" }
/**
* | output |
* | --- |
* | "New" |
*
* @param {Reports_Header_Newshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_header_newshort1 = /** @type {((inputs?: Reports_Header_Newshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Header_Newshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_header_newshort1(inputs)
	return __cs.reports_header_newshort1(inputs)
});
export { reports_header_newshort1 as "reports.header.newShort" }
/**
* | output |
* | --- |
* | "Back to cleaning" |
*
* @param {Reports_Nav_Backtocleaning2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_nav_backtocleaning2 = /** @type {((inputs?: Reports_Nav_Backtocleaning2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Nav_Backtocleaning2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_nav_backtocleaning2(inputs)
	return __cs.reports_nav_backtocleaning2(inputs)
});
export { reports_nav_backtocleaning2 as "reports.nav.backToCleaning" }
/**
* | output |
* | --- |
* | "Total reports" |
*
* @param {Reports_Stats_Totalreports1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_totalreports1 = /** @type {((inputs?: Reports_Stats_Totalreports1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Totalreports1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_stats_totalreports1(inputs)
	return __cs.reports_stats_totalreports1(inputs)
});
export { reports_stats_totalreports1 as "reports.stats.totalReports" }
/**
* | output |
* | --- |
* | "Metadata fields removed" |
*
* @param {Reports_Stats_Fieldsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_fieldsremoved1 = /** @type {((inputs?: Reports_Stats_Fieldsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Fieldsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_stats_fieldsremoved1(inputs)
	return __cs.reports_stats_fieldsremoved1(inputs)
});
export { reports_stats_fieldsremoved1 as "reports.stats.fieldsRemoved" }
/**
* | output |
* | --- |
* | "Files processed" |
*
* @param {Reports_Stats_Filesprocessed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_filesprocessed1 = /** @type {((inputs?: Reports_Stats_Filesprocessed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Filesprocessed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_stats_filesprocessed1(inputs)
	return __cs.reports_stats_filesprocessed1(inputs)
});
export { reports_stats_filesprocessed1 as "reports.stats.filesProcessed" }
/**
* | output |
* | --- |
* | "GPS locations removed" |
*
* @param {Reports_Stats_Gpsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_gpsremoved1 = /** @type {((inputs?: Reports_Stats_Gpsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Gpsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_stats_gpsremoved1(inputs)
	return __cs.reports_stats_gpsremoved1(inputs)
});
export { reports_stats_gpsremoved1 as "reports.stats.gpsRemoved" }
/**
* | output |
* | --- |
* | "Filter:" |
*
* @param {Reports_Filter_LabelInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_label = /** @type {((inputs?: Reports_Filter_LabelInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_LabelInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filter_label(inputs)
	return __cs.reports_filter_label(inputs)
});
export { reports_filter_label as "reports.filter.label" }
/**
* | output |
* | --- |
* | "All" |
*
* @param {Reports_Filter_AllInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_all = /** @type {((inputs?: Reports_Filter_AllInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_AllInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filter_all(inputs)
	return __cs.reports_filter_all(inputs)
});
export { reports_filter_all as "reports.filter.all" }
/**
* | output |
* | --- |
* | "Successful" |
*
* @param {Reports_Filter_SuccessfulInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_successful = /** @type {((inputs?: Reports_Filter_SuccessfulInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_SuccessfulInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filter_successful(inputs)
	return __cs.reports_filter_successful(inputs)
});
export { reports_filter_successful as "reports.filter.successful" }
/**
* | output |
* | --- |
* | "Contained GPS" |
*
* @param {Reports_Filter_Containedgps1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_containedgps1 = /** @type {((inputs?: Reports_Filter_Containedgps1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_Containedgps1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filter_containedgps1(inputs)
	return __cs.reports_filter_containedgps1(inputs)
});
export { reports_filter_containedgps1 as "reports.filter.containedGps" }
/**
* | output |
* | --- |
* | "Photos" |
*
* @param {Reports_Filter_PhotosInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_photos = /** @type {((inputs?: Reports_Filter_PhotosInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_PhotosInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filter_photos(inputs)
	return __cs.reports_filter_photos(inputs)
});
export { reports_filter_photos as "reports.filter.photos" }
/**
* | output |
* | --- |
* | "Video" |
*
* @param {Reports_Filter_VideoInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_video = /** @type {((inputs?: Reports_Filter_VideoInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_VideoInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filter_video(inputs)
	return __cs.reports_filter_video(inputs)
});
export { reports_filter_video as "reports.filter.video" }
/**
* | output |
* | --- |
* | "Search report..." |
*
* @param {Reports_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_search_placeholder = /** @type {((inputs?: Reports_Search_PlaceholderInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Search_PlaceholderInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_search_placeholder(inputs)
	return __cs.reports_search_placeholder(inputs)
});
export { reports_search_placeholder as "reports.search.placeholder" }
/**
* | output |
* | --- |
* | "Report list" |
*
* @param {Reports_Table_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_title = /** @type {((inputs?: Reports_Table_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_title(inputs)
	return __cs.reports_table_title(inputs)
});
export { reports_table_title as "reports.table.title" }
/**
* | output |
* | --- |
* | "Shown {filtered} of {total}" |
*
* @param {Reports_Table_ShownInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_shown = /** @type {((inputs: Reports_Table_ShownInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_ShownInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_shown(inputs)
	return __cs.reports_table_shown(inputs)
});
export { reports_table_shown as "reports.table.shown" }
/**
* | output |
* | --- |
* | "ID" |
*
* @param {Reports_Table_IdInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_id = /** @type {((inputs?: Reports_Table_IdInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_IdInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_id(inputs)
	return __cs.reports_table_id(inputs)
});
export { reports_table_id as "reports.table.id" }
/**
* | output |
* | --- |
* | "Date" |
*
* @param {Reports_Table_DateInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_date = /** @type {((inputs?: Reports_Table_DateInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_DateInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_date(inputs)
	return __cs.reports_table_date(inputs)
});
export { reports_table_date as "reports.table.date" }
/**
* | output |
* | --- |
* | "Files" |
*
* @param {Reports_Table_FilesInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_files = /** @type {((inputs?: Reports_Table_FilesInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_FilesInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_files(inputs)
	return __cs.reports_table_files(inputs)
});
export { reports_table_files as "reports.table.files" }
/**
* | output |
* | --- |
* | "Fields" |
*
* @param {Reports_Table_FieldsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_fields = /** @type {((inputs?: Reports_Table_FieldsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_FieldsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_fields(inputs)
	return __cs.reports_table_fields(inputs)
});
export { reports_table_fields as "reports.table.fields" }
/**
* | output |
* | --- |
* | "Tags" |
*
* @param {Reports_Table_TagsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_tags = /** @type {((inputs?: Reports_Table_TagsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_TagsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_tags(inputs)
	return __cs.reports_table_tags(inputs)
});
export { reports_table_tags as "reports.table.tags" }
/**
* | output |
* | --- |
* | "Status" |
*
* @param {Reports_Table_StatusInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_status = /** @type {((inputs?: Reports_Table_StatusInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_StatusInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_status(inputs)
	return __cs.reports_table_status(inputs)
});
export { reports_table_status as "reports.table.status" }
/**
* | output |
* | --- |
* | "Actions" |
*
* @param {Reports_Table_ActionsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_actions = /** @type {((inputs?: Reports_Table_ActionsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_ActionsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_actions(inputs)
	return __cs.reports_table_actions(inputs)
});
export { reports_table_actions as "reports.table.actions" }
/**
* | output |
* | --- |
* | "fields removed" |
*
* @param {Reports_Table_Fieldsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_fieldsremoved1 = /** @type {((inputs?: Reports_Table_Fieldsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_Fieldsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_fieldsremoved1(inputs)
	return __cs.reports_table_fieldsremoved1(inputs)
});
export { reports_table_fieldsremoved1 as "reports.table.fieldsRemoved" }
/**
* | output |
* | --- |
* | "fields" |
*
* @param {Reports_Table_Fieldsmobile1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_fieldsmobile1 = /** @type {((inputs?: Reports_Table_Fieldsmobile1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_Fieldsmobile1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_fieldsmobile1(inputs)
	return __cs.reports_table_fieldsmobile1(inputs)
});
export { reports_table_fieldsmobile1 as "reports.table.fieldsMobile" }
/**
* | output |
* | --- |
* | "No reports match your search." |
*
* @param {Reports_Table_Noresults1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_noresults1 = /** @type {((inputs?: Reports_Table_Noresults1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_Noresults1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_noresults1(inputs)
	return __cs.reports_table_noresults1(inputs)
});
export { reports_table_noresults1 as "reports.table.noResults" }
/**
* | output |
* | --- |
* | "View report" |
*
* @param {Reports_Table_Viewreport1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_viewreport1 = /** @type {((inputs?: Reports_Table_Viewreport1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_Viewreport1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_viewreport1(inputs)
	return __cs.reports_table_viewreport1(inputs)
});
export { reports_table_viewreport1 as "reports.table.viewReport" }
/**
* | output |
* | --- |
* | "Download PDF" |
*
* @param {Reports_Table_Downloadpdf1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_table_downloadpdf1 = /** @type {((inputs?: Reports_Table_Downloadpdf1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Table_Downloadpdf1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_table_downloadpdf1(inputs)
	return __cs.reports_table_downloadpdf1(inputs)
});
export { reports_table_downloadpdf1 as "reports.table.downloadPdf" }
/**
* | output |
* | --- |
* | "Metadata fields" |
*
* @param {Reports_Stats_Fieldsremovedshort2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_fieldsremovedshort2 = /** @type {((inputs?: Reports_Stats_Fieldsremovedshort2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Fieldsremovedshort2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_stats_fieldsremovedshort2(inputs)
	return __cs.reports_stats_fieldsremovedshort2(inputs)
});
export { reports_stats_fieldsremovedshort2 as "reports.stats.fieldsRemovedShort" }
/**
* | output |
* | --- |
* | "GPS removed" |
*
* @param {Reports_Stats_Gpsremovedshort2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_stats_gpsremovedshort2 = /** @type {((inputs?: Reports_Stats_Gpsremovedshort2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Stats_Gpsremovedshort2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_stats_gpsremovedshort2(inputs)
	return __cs.reports_stats_gpsremovedshort2(inputs)
});
export { reports_stats_gpsremovedshort2 as "reports.stats.gpsRemovedShort" }
/**
* | output |
* | --- |
* | "GPS" |
*
* @param {Reports_Filter_Containedgpsshort2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_containedgpsshort2 = /** @type {((inputs?: Reports_Filter_Containedgpsshort2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_Containedgpsshort2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filter_containedgpsshort2(inputs)
	return __cs.reports_filter_containedgpsshort2(inputs)
});
export { reports_filter_containedgpsshort2 as "reports.filter.containedGpsShort" }
/**
* | output |
* | --- |
* | "Photos" |
*
* @param {Reports_Filter_Photosshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filter_photosshort1 = /** @type {((inputs?: Reports_Filter_Photosshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filter_Photosshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filter_photosshort1(inputs)
	return __cs.reports_filter_photosshort1(inputs)
});
export { reports_filter_photosshort1 as "reports.filter.photosShort" }
/**
* | output |
* | --- |
* | "1 file" |
*
* @param {Reports_Filecount_One1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filecount_one1 = /** @type {((inputs?: Reports_Filecount_One1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filecount_One1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filecount_one1(inputs)
	return __cs.reports_filecount_one1(inputs)
});
export { reports_filecount_one1 as "reports.fileCount.one" }
/**
* | output |
* | --- |
* | "{count} files" |
*
* @param {Reports_Filecount_Few1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filecount_few1 = /** @type {((inputs: Reports_Filecount_Few1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filecount_Few1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filecount_few1(inputs)
	return __cs.reports_filecount_few1(inputs)
});
export { reports_filecount_few1 as "reports.fileCount.few" }
/**
* | output |
* | --- |
* | "{count} files" |
*
* @param {Reports_Filecount_Many1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_filecount_many1 = /** @type {((inputs: Reports_Filecount_Many1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Filecount_Many1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_filecount_many1(inputs)
	return __cs.reports_filecount_many1(inputs)
});
export { reports_filecount_many1 as "reports.fileCount.many" }
/**
* | output |
* | --- |
* | "Downloading:" |
*
* @param {Reports_Toast_DownloadingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const reports_toast_downloading = /** @type {((inputs?: Reports_Toast_DownloadingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reports_Toast_DownloadingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.reports_toast_downloading(inputs)
	return __cs.reports_toast_downloading(inputs)
});
export { reports_toast_downloading as "reports.toast.downloading" }
/**
* | output |
* | --- |
* | "MetaCleaner — Detailed Cleaning Report" |
*
* @param {Report_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_title = /** @type {((inputs?: Report_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_meta_title(inputs)
	return __cs.report_meta_title(inputs)
});
export { report_meta_title as "report.meta.title" }
/**
* | output |
* | --- |
* | "Detailed cleaning report" |
*
* @param {Report_Header_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_header_title = /** @type {((inputs?: Report_Header_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Header_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_header_title(inputs)
	return __cs.report_header_title(inputs)
});
export { report_header_title as "report.header.title" }
/**
* | output |
* | --- |
* | "Generated:" |
*
* @param {Report_Header_GeneratedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_header_generated = /** @type {((inputs?: Report_Header_GeneratedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Header_GeneratedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_header_generated(inputs)
	return __cs.report_header_generated(inputs)
});
export { report_header_generated as "report.header.generated" }
/**
* | output |
* | --- |
* | "Download PDF report" |
*
* @param {Report_Actions_Downloadpdf1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_actions_downloadpdf1 = /** @type {((inputs?: Report_Actions_Downloadpdf1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Actions_Downloadpdf1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_actions_downloadpdf1(inputs)
	return __cs.report_actions_downloadpdf1(inputs)
});
export { report_actions_downloadpdf1 as "report.actions.downloadPdf" }
/**
* | output |
* | --- |
* | "Download PDF" |
*
* @param {Report_Actions_Downloadpdfshort2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_actions_downloadpdfshort2 = /** @type {((inputs?: Report_Actions_Downloadpdfshort2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Actions_Downloadpdfshort2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_actions_downloadpdfshort2(inputs)
	return __cs.report_actions_downloadpdfshort2(inputs)
});
export { report_actions_downloadpdfshort2 as "report.actions.downloadPdfShort" }
/**
* | output |
* | --- |
* | "Print" |
*
* @param {Report_Actions_PrintInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_actions_print = /** @type {((inputs?: Report_Actions_PrintInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Actions_PrintInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_actions_print(inputs)
	return __cs.report_actions_print(inputs)
});
export { report_actions_print as "report.actions.print" }
/**
* | output |
* | --- |
* | "Back to results" |
*
* @param {Report_Nav_Backtoresults2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_nav_backtoresults2 = /** @type {((inputs?: Report_Nav_Backtoresults2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Nav_Backtoresults2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_nav_backtoresults2(inputs)
	return __cs.report_nav_backtoresults2(inputs)
});
export { report_nav_backtoresults2 as "report.nav.backToResults" }
/**
* | output |
* | --- |
* | "Report ID" |
*
* @param {Report_Meta_Reportid1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_reportid1 = /** @type {((inputs?: Report_Meta_Reportid1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_Reportid1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_meta_reportid1(inputs)
	return __cs.report_meta_reportid1(inputs)
});
export { report_meta_reportid1 as "report.meta.reportId" }
/**
* | output |
* | --- |
* | "Cleaning date" |
*
* @param {Report_Meta_Cleaningdate1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_cleaningdate1 = /** @type {((inputs?: Report_Meta_Cleaningdate1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_Cleaningdate1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_meta_cleaningdate1(inputs)
	return __cs.report_meta_cleaningdate1(inputs)
});
export { report_meta_cleaningdate1 as "report.meta.cleaningDate" }
/**
* | output |
* | --- |
* | "User" |
*
* @param {Report_Meta_UserInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_user = /** @type {((inputs?: Report_Meta_UserInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_UserInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_meta_user(inputs)
	return __cs.report_meta_user(inputs)
});
export { report_meta_user as "report.meta.user" }
/**
* | output |
* | --- |
* | "Status" |
*
* @param {Report_Meta_StatusInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_status = /** @type {((inputs?: Report_Meta_StatusInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_StatusInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_meta_status(inputs)
	return __cs.report_meta_status(inputs)
});
export { report_meta_status as "report.meta.status" }
/**
* | output |
* | --- |
* | "100% Successfully completed" |
*
* @param {Report_Meta_Statussuccess1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_statussuccess1 = /** @type {((inputs?: Report_Meta_Statussuccess1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_Statussuccess1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_meta_statussuccess1(inputs)
	return __cs.report_meta_statussuccess1(inputs)
});
export { report_meta_statussuccess1 as "report.meta.statusSuccess" }
/**
* | output |
* | --- |
* | "100% Completed" |
*
* @param {Report_Meta_Statussuccessmobile2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_meta_statussuccessmobile2 = /** @type {((inputs?: Report_Meta_Statussuccessmobile2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Meta_Statussuccessmobile2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_meta_statussuccessmobile2(inputs)
	return __cs.report_meta_statussuccessmobile2(inputs)
});
export { report_meta_statussuccessmobile2 as "report.meta.statusSuccessMobile" }
/**
* | output |
* | --- |
* | "Files processed" |
*
* @param {Report_Stats_Filesprocessed1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_stats_filesprocessed1 = /** @type {((inputs?: Report_Stats_Filesprocessed1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Stats_Filesprocessed1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_stats_filesprocessed1(inputs)
	return __cs.report_stats_filesprocessed1(inputs)
});
export { report_stats_filesprocessed1 as "report.stats.filesProcessed" }
/**
* | output |
* | --- |
* | "Metadata fields removed" |
*
* @param {Report_Stats_Fieldsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_stats_fieldsremoved1 = /** @type {((inputs?: Report_Stats_Fieldsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Stats_Fieldsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_stats_fieldsremoved1(inputs)
	return __cs.report_stats_fieldsremoved1(inputs)
});
export { report_stats_fieldsremoved1 as "report.stats.fieldsRemoved" }
/**
* | output |
* | --- |
* | "GPS locations removed" |
*
* @param {Report_Stats_Gpsremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_stats_gpsremoved1 = /** @type {((inputs?: Report_Stats_Gpsremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Stats_Gpsremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_stats_gpsremoved1(inputs)
	return __cs.report_stats_gpsremoved1(inputs)
});
export { report_stats_gpsremoved1 as "report.stats.gpsRemoved" }
/**
* | output |
* | --- |
* | "Total cleaning time" |
*
* @param {Report_Stats_Totaltime1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_stats_totaltime1 = /** @type {((inputs?: Report_Stats_Totaltime1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Stats_Totaltime1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_stats_totaltime1(inputs)
	return __cs.report_stats_totaltime1(inputs)
});
export { report_stats_totaltime1 as "report.stats.totalTime" }
/**
* | output |
* | --- |
* | "Distribution of removed metadata" |
*
* @param {Report_Chart_Distributiontitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_distributiontitle1 = /** @type {((inputs?: Report_Chart_Distributiontitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Distributiontitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_distributiontitle1(inputs)
	return __cs.report_chart_distributiontitle1(inputs)
});
export { report_chart_distributiontitle1 as "report.chart.distributionTitle" }
/**
* | output |
* | --- |
* | "By metadata type across all files" |
*
* @param {Report_Chart_Distributiondesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_distributiondesc1 = /** @type {((inputs?: Report_Chart_Distributiondesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Distributiondesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_distributiondesc1(inputs)
	return __cs.report_chart_distributiondesc1(inputs)
});
export { report_chart_distributiondesc1 as "report.chart.distributionDesc" }
/**
* | output |
* | --- |
* | "Fields removed per file" |
*
* @param {Report_Chart_Perfiletitle2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_perfiletitle2 = /** @type {((inputs?: Report_Chart_Perfiletitle2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Perfiletitle2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_perfiletitle2(inputs)
	return __cs.report_chart_perfiletitle2(inputs)
});
export { report_chart_perfiletitle2 as "report.chart.perFileTitle" }
/**
* | output |
* | --- |
* | "Metadata fields removed per file" |
*
* @param {Report_Chart_Perfiledesc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_perfiledesc2 = /** @type {((inputs?: Report_Chart_Perfiledesc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Perfiledesc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_perfiledesc2(inputs)
	return __cs.report_chart_perfiledesc2(inputs)
});
export { report_chart_perfiledesc2 as "report.chart.perFileDesc" }
/**
* | output |
* | --- |
* | "Total removed" |
*
* @param {Report_Chart_Totalremoved1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_totalremoved1 = /** @type {((inputs?: Report_Chart_Totalremoved1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Totalremoved1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_totalremoved1(inputs)
	return __cs.report_chart_totalremoved1(inputs)
});
export { report_chart_totalremoved1 as "report.chart.totalRemoved" }
/**
* | output |
* | --- |
* | "fields" |
*
* @param {Report_Chart_FieldsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_fields = /** @type {((inputs?: Report_Chart_FieldsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_FieldsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_fields(inputs)
	return __cs.report_chart_fields(inputs)
});
export { report_chart_fields as "report.chart.fields" }
/**
* | output |
* | --- |
* | "GPS Data" |
*
* @param {Report_Chart_Gpsdata1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_gpsdata1 = /** @type {((inputs?: Report_Chart_Gpsdata1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Gpsdata1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_gpsdata1(inputs)
	return __cs.report_chart_gpsdata1(inputs)
});
export { report_chart_gpsdata1 as "report.chart.gpsData" }
/**
* | output |
* | --- |
* | "EXIF Data" |
*
* @param {Report_Chart_Exifdata1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_exifdata1 = /** @type {((inputs?: Report_Chart_Exifdata1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Exifdata1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_exifdata1(inputs)
	return __cs.report_chart_exifdata1(inputs)
});
export { report_chart_exifdata1 as "report.chart.exifData" }
/**
* | output |
* | --- |
* | "XMP Data" |
*
* @param {Report_Chart_Xmpdata1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_xmpdata1 = /** @type {((inputs?: Report_Chart_Xmpdata1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Xmpdata1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_xmpdata1(inputs)
	return __cs.report_chart_xmpdata1(inputs)
});
export { report_chart_xmpdata1 as "report.chart.xmpData" }
/**
* | output |
* | --- |
* | "ID3 Tags" |
*
* @param {Report_Chart_Id3data1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_id3data1 = /** @type {((inputs?: Report_Chart_Id3data1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Id3data1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_id3data1(inputs)
	return __cs.report_chart_id3data1(inputs)
});
export { report_chart_id3data1 as "report.chart.id3Data" }
/**
* | output |
* | --- |
* | "MP4 Atoms" |
*
* @param {Report_Chart_Mp4data1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_mp4data1 = /** @type {((inputs?: Report_Chart_Mp4data1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_Mp4data1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_chart_mp4data1(inputs)
	return __cs.report_chart_mp4data1(inputs)
});
export { report_chart_mp4data1 as "report.chart.mp4Data" }
/**
* | output |
* | --- |
* | "Detailed file overview" |
*
* @param {Report_Files_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_title = /** @type {((inputs?: Report_Files_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_files_title(inputs)
	return __cs.report_files_title(inputs)
});
export { report_files_title as "report.files.title" }
/**
* | output |
* | --- |
* | "Collapse all" |
*
* @param {Report_Files_Collapseall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_collapseall1 = /** @type {((inputs?: Report_Files_Collapseall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_Collapseall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_files_collapseall1(inputs)
	return __cs.report_files_collapseall1(inputs)
});
export { report_files_collapseall1 as "report.files.collapseAll" }
/**
* | output |
* | --- |
* | "Expand all" |
*
* @param {Report_Files_Expandall1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_expandall1 = /** @type {((inputs?: Report_Files_Expandall1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_Expandall1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_files_expandall1(inputs)
	return __cs.report_files_expandall1(inputs)
});
export { report_files_expandall1 as "report.files.expandAll" }
/**
* | output |
* | --- |
* | "File is safe to share." |
*
* @param {Report_Files_Safetoshare2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_safetoshare2 = /** @type {((inputs?: Report_Files_Safetoshare2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_Safetoshare2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_files_safetoshare2(inputs)
	return __cs.report_files_safetoshare2(inputs)
});
export { report_files_safetoshare2 as "report.files.safeToShare" }
/**
* | output |
* | --- |
* | "metadata fields" |
*
* @param {Report_Files_Metadatafields1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_metadatafields1 = /** @type {((inputs?: Report_Files_Metadatafields1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_Metadatafields1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_files_metadatafields1(inputs)
	return __cs.report_files_metadatafields1(inputs)
});
export { report_files_metadatafields1 as "report.files.metadataFields" }
/**
* | output |
* | --- |
* | "more" |
*
* @param {Report_Files_MoreInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_more = /** @type {((inputs?: Report_Files_MoreInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_MoreInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_files_more(inputs)
	return __cs.report_files_more(inputs)
});
export { report_files_more as "report.files.more" }
/**
* | output |
* | --- |
* | "removed" |
*
* @param {Report_Files_RemovedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_files_removed = /** @type {((inputs?: Report_Files_RemovedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Files_RemovedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_files_removed(inputs)
	return __cs.report_files_removed(inputs)
});
export { report_files_removed as "report.files.removed" }
/**
* | output |
* | --- |
* | "{date} · {files} files · {fields} fields removed" |
*
* @param {Report_Header_Generateddesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_header_generateddesc1 = /** @type {((inputs: Report_Header_Generateddesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Header_Generateddesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.report_header_generateddesc1(inputs)
	return __cs.report_header_generateddesc1(inputs)
});
export { report_header_generateddesc1 as "report.header.generatedDesc" }
/**
* | output |
* | --- |
* | "Loading..." |
*
* @param {Common_LoadingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_loading = /** @type {((inputs?: Common_LoadingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_LoadingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_loading(inputs)
	return __cs.common_loading(inputs)
});
export { common_loading as "common.loading" }
/**
* | output |
* | --- |
* | "An error occurred. Please try again." |
*
* @param {Common_ErrorInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_error = /** @type {((inputs?: Common_ErrorInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_ErrorInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_error(inputs)
	return __cs.common_error(inputs)
});
export { common_error as "common.error" }
/**
* | output |
* | --- |
* | "Download failed. Please try again." |
*
* @param {Common_Downloaderror1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_downloaderror1 = /** @type {((inputs?: Common_Downloaderror1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Downloaderror1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_downloaderror1(inputs)
	return __cs.common_downloaderror1(inputs)
});
export { common_downloaderror1 as "common.downloadError" }
/**
* | output |
* | --- |
* | "© 2025 MetaCleaner. All rights reserved." |
*
* @param {Common_Footer_CopyrightInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_footer_copyright = /** @type {((inputs?: Common_Footer_CopyrightInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Footer_CopyrightInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_footer_copyright(inputs)
	return __cs.common_footer_copyright(inputs)
});
export { common_footer_copyright as "common.footer.copyright" }
/**
* | output |
* | --- |
* | "{count} file(s) exceeded the 500 MB size limit" |
*
* @param {Step1_Upload_Rejectedtoolarge2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_rejectedtoolarge2 = /** @type {((inputs: Step1_Upload_Rejectedtoolarge2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Rejectedtoolarge2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_rejectedtoolarge2(inputs)
	return __cs.step1_upload_rejectedtoolarge2(inputs)
});
export { step1_upload_rejectedtoolarge2 as "step1.upload.rejectedTooLarge" }
/**
* | output |
* | --- |
* | "{count} file(s) have an unsupported format" |
*
* @param {Step1_Upload_Rejectedunsupported1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_upload_rejectedunsupported1 = /** @type {((inputs: Step1_Upload_Rejectedunsupported1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Upload_Rejectedunsupported1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_upload_rejectedunsupported1(inputs)
	return __cs.step1_upload_rejectedunsupported1(inputs)
});
export { step1_upload_rejectedunsupported1 as "step1.upload.rejectedUnsupported" }
/**
* | output |
* | --- |
* | "Waiting for files" |
*
* @param {Step1_Status_WaitingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step1_status_waiting = /** @type {((inputs?: Step1_Status_WaitingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step1_Status_WaitingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step1_status_waiting(inputs)
	return __cs.step1_status_waiting(inputs)
});
export { step1_status_waiting as "step1.status.waiting" }
/**
* | output |
* | --- |
* | "Start cleaning" |
*
* @param {Common_Startcleaning1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_startcleaning1 = /** @type {((inputs?: Common_Startcleaning1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Startcleaning1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_startcleaning1(inputs)
	return __cs.common_startcleaning1(inputs)
});
export { common_startcleaning1 as "common.startCleaning" }
/**
* | output |
* | --- |
* | "Download" |
*
* @param {Common_DownloadInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_download = /** @type {((inputs?: Common_DownloadInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_DownloadInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_download(inputs)
	return __cs.common_download(inputs)
});
export { common_download as "common.download" }
/**
* | output |
* | --- |
* | "Download all (ZIP)" |
*
* @param {Common_Downloadzip1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_downloadzip1 = /** @type {((inputs?: Common_Downloadzip1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Downloadzip1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_downloadzip1(inputs)
	return __cs.common_downloadzip1(inputs)
});
export { common_downloadzip1 as "common.downloadZip" }
/**
* | output |
* | --- |
* | "View report" |
*
* @param {Common_Viewreport1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_viewreport1 = /** @type {((inputs?: Common_Viewreport1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Viewreport1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_viewreport1(inputs)
	return __cs.common_viewreport1(inputs)
});
export { common_viewreport1 as "common.viewReport" }
/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Common_DismissInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_dismiss = /** @type {((inputs?: Common_DismissInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_DismissInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_dismiss(inputs)
	return __cs.common_dismiss(inputs)
});
export { common_dismiss as "common.dismiss" }
/**
* | output |
* | --- |
* | "Remove file" |
*
* @param {Common_Removefile1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_removefile1 = /** @type {((inputs?: Common_Removefile1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Removefile1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_removefile1(inputs)
	return __cs.common_removefile1(inputs)
});
export { common_removefile1 as "common.removeFile" }
/**
* | output |
* | --- |
* | "Open menu" |
*
* @param {Common_Openmenu1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_openmenu1 = /** @type {((inputs?: Common_Openmenu1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Openmenu1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_openmenu1(inputs)
	return __cs.common_openmenu1(inputs)
});
export { common_openmenu1 as "common.openMenu" }
/**
* | output |
* | --- |
* | "Close menu" |
*
* @param {Common_Closemenu1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_closemenu1 = /** @type {((inputs?: Common_Closemenu1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Closemenu1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_closemenu1(inputs)
	return __cs.common_closemenu1(inputs)
});
export { common_closemenu1 as "common.closeMenu" }
/**
* | output |
* | --- |
* | "Go back" |
*
* @param {Common_Goback1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const common_goback1 = /** @type {((inputs?: Common_Goback1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Goback1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.common_goback1(inputs)
	return __cs.common_goback1(inputs)
});
export { common_goback1 as "common.goBack" }
/**
* | output |
* | --- |
* | "Risk score: {score} out of 100. Severity: {severity}." |
*
* @param {Step2_Risk_Srannouncement1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_srannouncement1 = /** @type {((inputs: Step2_Risk_Srannouncement1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Srannouncement1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.step2_risk_srannouncement1(inputs)
	return __cs.step2_risk_srannouncement1(inputs)
});
export { step2_risk_srannouncement1 as "step2.risk.srAnnouncement" }
/**
* | output |
* | --- |
* | "SSL encryption" |
*
* @param {Auth_Common_Trust_SslInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_ssl = /** @type {((inputs?: Auth_Common_Trust_SslInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_SslInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_trust_ssl(inputs)
	return __cs.auth_common_trust_ssl(inputs)
});
export { auth_common_trust_ssl as "auth.common.trust.ssl" }
/**
* | output |
* | --- |
* | "GDPR compliant" |
*
* @param {Auth_Common_Trust_GdprInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_gdpr = /** @type {((inputs?: Auth_Common_Trust_GdprInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_GdprInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_trust_gdpr(inputs)
	return __cs.auth_common_trust_gdpr(inputs)
});
export { auth_common_trust_gdpr as "auth.common.trust.gdpr" }
/**
* | output |
* | --- |
* | "No tracking" |
*
* @param {Auth_Common_Trust_Notracking1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_notracking1 = /** @type {((inputs?: Auth_Common_Trust_Notracking1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_Notracking1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_trust_notracking1(inputs)
	return __cs.auth_common_trust_notracking1(inputs)
});
export { auth_common_trust_notracking1 as "auth.common.trust.noTracking" }
/**
* | output |
* | --- |
* | "SSL" |
*
* @param {Auth_Common_Trust_Sslshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_sslshort1 = /** @type {((inputs?: Auth_Common_Trust_Sslshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_Sslshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_trust_sslshort1(inputs)
	return __cs.auth_common_trust_sslshort1(inputs)
});
export { auth_common_trust_sslshort1 as "auth.common.trust.sslShort" }
/**
* | output |
* | --- |
* | "GDPR" |
*
* @param {Auth_Common_Trust_Gdprshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_trust_gdprshort1 = /** @type {((inputs?: Auth_Common_Trust_Gdprshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Trust_Gdprshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_trust_gdprshort1(inputs)
	return __cs.auth_common_trust_gdprshort1(inputs)
});
export { auth_common_trust_gdprshort1 as "auth.common.trust.gdprShort" }
/**
* | output |
* | --- |
* | "Users" |
*
* @param {Auth_Common_Stats_Userslabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_stats_userslabel1 = /** @type {((inputs?: Auth_Common_Stats_Userslabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Stats_Userslabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_stats_userslabel1(inputs)
	return __cs.auth_common_stats_userslabel1(inputs)
});
export { auth_common_stats_userslabel1 as "auth.common.stats.usersLabel" }
/**
* | output |
* | --- |
* | "Files cleaned" |
*
* @param {Auth_Common_Stats_Filescleanedlabel2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_stats_filescleanedlabel2 = /** @type {((inputs?: Auth_Common_Stats_Filescleanedlabel2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Stats_Filescleanedlabel2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_stats_filescleanedlabel2(inputs)
	return __cs.auth_common_stats_filescleanedlabel2(inputs)
});
export { auth_common_stats_filescleanedlabel2 as "auth.common.stats.filesCleanedLabel" }
/**
* | output |
* | --- |
* | "Security" |
*
* @param {Auth_Common_Stats_Securitylabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_stats_securitylabel1 = /** @type {((inputs?: Auth_Common_Stats_Securitylabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Stats_Securitylabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_stats_securitylabel1(inputs)
	return __cs.auth_common_stats_securitylabel1(inputs)
});
export { auth_common_stats_securitylabel1 as "auth.common.stats.securityLabel" }
/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Common_Nav_LoginInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_login = /** @type {((inputs?: Auth_Common_Nav_LoginInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_LoginInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_nav_login(inputs)
	return __cs.auth_common_nav_login(inputs)
});
export { auth_common_nav_login as "auth.common.nav.login" }
/**
* | output |
* | --- |
* | "Remembered?" |
*
* @param {Auth_Common_Nav_RememberedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_remembered = /** @type {((inputs?: Auth_Common_Nav_RememberedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_RememberedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_nav_remembered(inputs)
	return __cs.auth_common_nav_remembered(inputs)
});
export { auth_common_nav_remembered as "auth.common.nav.remembered" }
/**
* | output |
* | --- |
* | "Back to sign in" |
*
* @param {Auth_Common_Nav_Backtologin2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_backtologin2 = /** @type {((inputs?: Auth_Common_Nav_Backtologin2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_Backtologin2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_nav_backtologin2(inputs)
	return __cs.auth_common_nav_backtologin2(inputs)
});
export { auth_common_nav_backtologin2 as "auth.common.nav.backToLogin" }
/**
* | output |
* | --- |
* | "Back" |
*
* @param {Auth_Common_Nav_BackInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_back = /** @type {((inputs?: Auth_Common_Nav_BackInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_BackInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_nav_back(inputs)
	return __cs.auth_common_nav_back(inputs)
});
export { auth_common_nav_back as "auth.common.nav.back" }
/**
* | output |
* | --- |
* | "Back to code verification" |
*
* @param {Auth_Common_Nav_Backtocode2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_nav_backtocode2 = /** @type {((inputs?: Auth_Common_Nav_Backtocode2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Nav_Backtocode2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_nav_backtocode2(inputs)
	return __cs.auth_common_nav_backtocode2(inputs)
});
export { auth_common_nav_backtocode2 as "auth.common.nav.backToCode" }
/**
* | output |
* | --- |
* | "Hide password" |
*
* @param {Auth_Common_A11y_Hidepassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_a11y_hidepassword1 = /** @type {((inputs?: Auth_Common_A11y_Hidepassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_A11y_Hidepassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_a11y_hidepassword1(inputs)
	return __cs.auth_common_a11y_hidepassword1(inputs)
});
export { auth_common_a11y_hidepassword1 as "auth.common.a11y.hidePassword" }
/**
* | output |
* | --- |
* | "Show password" |
*
* @param {Auth_Common_A11y_Showpassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_a11y_showpassword1 = /** @type {((inputs?: Auth_Common_A11y_Showpassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_A11y_Showpassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_a11y_showpassword1(inputs)
	return __cs.auth_common_a11y_showpassword1(inputs)
});
export { auth_common_a11y_showpassword1 as "auth.common.a11y.showPassword" }
/**
* | output |
* | --- |
* | "Please enter a valid email address." |
*
* @param {Auth_Common_Validation_Emailinvalid1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_emailinvalid1 = /** @type {((inputs?: Auth_Common_Validation_Emailinvalid1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Emailinvalid1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_validation_emailinvalid1(inputs)
	return __cs.auth_common_validation_emailinvalid1(inputs)
});
export { auth_common_validation_emailinvalid1 as "auth.common.validation.emailInvalid" }
/**
* | output |
* | --- |
* | "Password must be at least 8 characters." |
*
* @param {Auth_Common_Validation_Passwordmin81Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_passwordmin81 = /** @type {((inputs?: Auth_Common_Validation_Passwordmin81Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Passwordmin81Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_validation_passwordmin81(inputs)
	return __cs.auth_common_validation_passwordmin81(inputs)
});
export { auth_common_validation_passwordmin81 as "auth.common.validation.passwordMin8" }
/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Auth_Common_Validation_Passwordsmismatch1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_passwordsmismatch1 = /** @type {((inputs?: Auth_Common_Validation_Passwordsmismatch1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Passwordsmismatch1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_validation_passwordsmismatch1(inputs)
	return __cs.auth_common_validation_passwordsmismatch1(inputs)
});
export { auth_common_validation_passwordsmismatch1 as "auth.common.validation.passwordsMismatch" }
/**
* | output |
* | --- |
* | "Passwords match." |
*
* @param {Auth_Common_Validation_Passwordsmatch1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_passwordsmatch1 = /** @type {((inputs?: Auth_Common_Validation_Passwordsmatch1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Passwordsmatch1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_validation_passwordsmatch1(inputs)
	return __cs.auth_common_validation_passwordsmatch1(inputs)
});
export { auth_common_validation_passwordsmatch1 as "auth.common.validation.passwordsMatch" }
/**
* | output |
* | --- |
* | "Please enter the complete 6-digit code." |
*
* @param {Auth_Common_Validation_Otpincomplete1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_otpincomplete1 = /** @type {((inputs?: Auth_Common_Validation_Otpincomplete1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Otpincomplete1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_validation_otpincomplete1(inputs)
	return __cs.auth_common_validation_otpincomplete1(inputs)
});
export { auth_common_validation_otpincomplete1 as "auth.common.validation.otpIncomplete" }
/**
* | output |
* | --- |
* | "Passwords do not match or are too short." |
*
* @param {Auth_Common_Validation_Passwordsmismatchorshort3Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_validation_passwordsmismatchorshort3 = /** @type {((inputs?: Auth_Common_Validation_Passwordsmismatchorshort3Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Validation_Passwordsmismatchorshort3Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_validation_passwordsmismatchorshort3(inputs)
	return __cs.auth_common_validation_passwordsmismatchorshort3(inputs)
});
export { auth_common_validation_passwordsmismatchorshort3 as "auth.common.validation.passwordsMismatchOrShort" }
/**
* | output |
* | --- |
* | "Very weak" |
*
* @param {Auth_Common_Strength_Veryweak1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_veryweak1 = /** @type {((inputs?: Auth_Common_Strength_Veryweak1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Veryweak1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_veryweak1(inputs)
	return __cs.auth_common_strength_veryweak1(inputs)
});
export { auth_common_strength_veryweak1 as "auth.common.strength.veryWeak" }
/**
* | output |
* | --- |
* | "Weak" |
*
* @param {Auth_Common_Strength_WeakInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_weak = /** @type {((inputs?: Auth_Common_Strength_WeakInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_WeakInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_weak(inputs)
	return __cs.auth_common_strength_weak(inputs)
});
export { auth_common_strength_weak as "auth.common.strength.weak" }
/**
* | output |
* | --- |
* | "Average" |
*
* @param {Auth_Common_Strength_AverageInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_average = /** @type {((inputs?: Auth_Common_Strength_AverageInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_AverageInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_average(inputs)
	return __cs.auth_common_strength_average(inputs)
});
export { auth_common_strength_average as "auth.common.strength.average" }
/**
* | output |
* | --- |
* | "Good" |
*
* @param {Auth_Common_Strength_GoodInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_good = /** @type {((inputs?: Auth_Common_Strength_GoodInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_GoodInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_good(inputs)
	return __cs.auth_common_strength_good(inputs)
});
export { auth_common_strength_good as "auth.common.strength.good" }
/**
* | output |
* | --- |
* | "Strong" |
*
* @param {Auth_Common_Strength_StrongInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_strong = /** @type {((inputs?: Auth_Common_Strength_StrongInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_StrongInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_strong(inputs)
	return __cs.auth_common_strength_strong(inputs)
});
export { auth_common_strength_strong as "auth.common.strength.strong" }
/**
* | output |
* | --- |
* | "Weak password" |
*
* @param {Auth_Common_Strength_Weakpassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_weakpassword1 = /** @type {((inputs?: Auth_Common_Strength_Weakpassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Weakpassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_weakpassword1(inputs)
	return __cs.auth_common_strength_weakpassword1(inputs)
});
export { auth_common_strength_weakpassword1 as "auth.common.strength.weakPassword" }
/**
* | output |
* | --- |
* | "Add more characters" |
*
* @param {Auth_Common_Strength_Addmore1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_addmore1 = /** @type {((inputs?: Auth_Common_Strength_Addmore1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Addmore1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_addmore1(inputs)
	return __cs.auth_common_strength_addmore1(inputs)
});
export { auth_common_strength_addmore1 as "auth.common.strength.addMore" }
/**
* | output |
* | --- |
* | "Average password" |
*
* @param {Auth_Common_Strength_Averagepassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_averagepassword1 = /** @type {((inputs?: Auth_Common_Strength_Averagepassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Averagepassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_averagepassword1(inputs)
	return __cs.auth_common_strength_averagepassword1(inputs)
});
export { auth_common_strength_averagepassword1 as "auth.common.strength.averagePassword" }
/**
* | output |
* | --- |
* | "Could be stronger" |
*
* @param {Auth_Common_Strength_Couldbestronger2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_couldbestronger2 = /** @type {((inputs?: Auth_Common_Strength_Couldbestronger2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Couldbestronger2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_couldbestronger2(inputs)
	return __cs.auth_common_strength_couldbestronger2(inputs)
});
export { auth_common_strength_couldbestronger2 as "auth.common.strength.couldBeStronger" }
/**
* | output |
* | --- |
* | "Strong password" |
*
* @param {Auth_Common_Strength_Strongpassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_strongpassword1 = /** @type {((inputs?: Auth_Common_Strength_Strongpassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Strongpassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_strongpassword1(inputs)
	return __cs.auth_common_strength_strongpassword1(inputs)
});
export { auth_common_strength_strongpassword1 as "auth.common.strength.strongPassword" }
/**
* | output |
* | --- |
* | "Almost perfect!" |
*
* @param {Auth_Common_Strength_Almostperfect1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_almostperfect1 = /** @type {((inputs?: Auth_Common_Strength_Almostperfect1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Almostperfect1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_almostperfect1(inputs)
	return __cs.auth_common_strength_almostperfect1(inputs)
});
export { auth_common_strength_almostperfect1 as "auth.common.strength.almostPerfect" }
/**
* | output |
* | --- |
* | "Very strong password" |
*
* @param {Auth_Common_Strength_Verystrongpassword2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_verystrongpassword2 = /** @type {((inputs?: Auth_Common_Strength_Verystrongpassword2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_Verystrongpassword2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_verystrongpassword2(inputs)
	return __cs.auth_common_strength_verystrongpassword2(inputs)
});
export { auth_common_strength_verystrongpassword2 as "auth.common.strength.veryStrongPassword" }
/**
* | output |
* | --- |
* | "Excellent!" |
*
* @param {Auth_Common_Strength_ExcellentInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_strength_excellent = /** @type {((inputs?: Auth_Common_Strength_ExcellentInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Strength_ExcellentInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_strength_excellent(inputs)
	return __cs.auth_common_strength_excellent(inputs)
});
export { auth_common_strength_excellent as "auth.common.strength.excellent" }
/**
* | output |
* | --- |
* | "Password requirements" |
*
* @param {Auth_Common_Requirements_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_title = /** @type {((inputs?: Auth_Common_Requirements_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_requirements_title(inputs)
	return __cs.auth_common_requirements_title(inputs)
});
export { auth_common_requirements_title as "auth.common.requirements.title" }
/**
* | output |
* | --- |
* | "At least 8 characters" |
*
* @param {Auth_Common_Requirements_Min8Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_min8 = /** @type {((inputs?: Auth_Common_Requirements_Min8Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_Min8Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_requirements_min8(inputs)
	return __cs.auth_common_requirements_min8(inputs)
});
export { auth_common_requirements_min8 as "auth.common.requirements.min8" }
/**
* | output |
* | --- |
* | "Uppercase letter" |
*
* @param {Auth_Common_Requirements_UppercaseInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_uppercase = /** @type {((inputs?: Auth_Common_Requirements_UppercaseInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_UppercaseInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_requirements_uppercase(inputs)
	return __cs.auth_common_requirements_uppercase(inputs)
});
export { auth_common_requirements_uppercase as "auth.common.requirements.uppercase" }
/**
* | output |
* | --- |
* | "Number" |
*
* @param {Auth_Common_Requirements_NumberInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_number = /** @type {((inputs?: Auth_Common_Requirements_NumberInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_NumberInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_requirements_number(inputs)
	return __cs.auth_common_requirements_number(inputs)
});
export { auth_common_requirements_number as "auth.common.requirements.number" }
/**
* | output |
* | --- |
* | "Uppercase letter (A–Z)" |
*
* @param {Auth_Common_Requirements_Uppercasefull1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_uppercasefull1 = /** @type {((inputs?: Auth_Common_Requirements_Uppercasefull1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_Uppercasefull1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_requirements_uppercasefull1(inputs)
	return __cs.auth_common_requirements_uppercasefull1(inputs)
});
export { auth_common_requirements_uppercasefull1 as "auth.common.requirements.uppercaseFull" }
/**
* | output |
* | --- |
* | "Lowercase letter (a–z)" |
*
* @param {Auth_Common_Requirements_LowercaseInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_lowercase = /** @type {((inputs?: Auth_Common_Requirements_LowercaseInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_LowercaseInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_requirements_lowercase(inputs)
	return __cs.auth_common_requirements_lowercase(inputs)
});
export { auth_common_requirements_lowercase as "auth.common.requirements.lowercase" }
/**
* | output |
* | --- |
* | "Number (0–9)" |
*
* @param {Auth_Common_Requirements_Numberfull1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_numberfull1 = /** @type {((inputs?: Auth_Common_Requirements_Numberfull1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_Numberfull1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_requirements_numberfull1(inputs)
	return __cs.auth_common_requirements_numberfull1(inputs)
});
export { auth_common_requirements_numberfull1 as "auth.common.requirements.numberFull" }
/**
* | output |
* | --- |
* | "Special character (!@#$%)" |
*
* @param {Auth_Common_Requirements_SpecialInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_special = /** @type {((inputs?: Auth_Common_Requirements_SpecialInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_SpecialInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_requirements_special(inputs)
	return __cs.auth_common_requirements_special(inputs)
});
export { auth_common_requirements_special as "auth.common.requirements.special" }
/**
* | output |
* | --- |
* | "Email address" |
*
* @param {Auth_Common_Field_Emaillabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_field_emaillabel1 = /** @type {((inputs?: Auth_Common_Field_Emaillabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Field_Emaillabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_field_emaillabel1(inputs)
	return __cs.auth_common_field_emaillabel1(inputs)
});
export { auth_common_field_emaillabel1 as "auth.common.field.emailLabel" }
/**
* | output |
* | --- |
* | "you@email.com" |
*
* @param {Auth_Common_Field_Emailplaceholder1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_field_emailplaceholder1 = /** @type {((inputs?: Auth_Common_Field_Emailplaceholder1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Field_Emailplaceholder1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_field_emailplaceholder1(inputs)
	return __cs.auth_common_field_emailplaceholder1(inputs)
});
export { auth_common_field_emailplaceholder1 as "auth.common.field.emailPlaceholder" }
/**
* | output |
* | --- |
* | "Password" |
*
* @param {Auth_Common_Field_Passwordlabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_field_passwordlabel1 = /** @type {((inputs?: Auth_Common_Field_Passwordlabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Field_Passwordlabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_field_passwordlabel1(inputs)
	return __cs.auth_common_field_passwordlabel1(inputs)
});
export { auth_common_field_passwordlabel1 as "auth.common.field.passwordLabel" }
/**
* | output |
* | --- |
* | "Confirm password" |
*
* @param {Auth_Common_Field_Confirmpasswordlabel2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_field_confirmpasswordlabel2 = /** @type {((inputs?: Auth_Common_Field_Confirmpasswordlabel2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Field_Confirmpasswordlabel2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_field_confirmpasswordlabel2(inputs)
	return __cs.auth_common_field_confirmpasswordlabel2(inputs)
});
export { auth_common_field_confirmpasswordlabel2 as "auth.common.field.confirmPasswordLabel" }
/**
* | output |
* | --- |
* | "New password" |
*
* @param {Auth_Common_Field_Newpasswordlabel2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_field_newpasswordlabel2 = /** @type {((inputs?: Auth_Common_Field_Newpasswordlabel2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Field_Newpasswordlabel2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_field_newpasswordlabel2(inputs)
	return __cs.auth_common_field_newpasswordlabel2(inputs)
});
export { auth_common_field_newpasswordlabel2 as "auth.common.field.newPasswordLabel" }
/**
* | output |
* | --- |
* | "or with email" |
*
* @param {Auth_Common_Divider_Oremail1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_divider_oremail1 = /** @type {((inputs?: Auth_Common_Divider_Oremail1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Divider_Oremail1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_divider_oremail1(inputs)
	return __cs.auth_common_divider_oremail1(inputs)
});
export { auth_common_divider_oremail1 as "auth.common.divider.orEmail" }
/**
* | output |
* | --- |
* | "Resend" |
*
* @param {Auth_Common_Action_ResendInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_action_resend = /** @type {((inputs?: Auth_Common_Action_ResendInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Action_ResendInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_action_resend(inputs)
	return __cs.auth_common_action_resend(inputs)
});
export { auth_common_action_resend as "auth.common.action.resend" }
/**
* | output |
* | --- |
* | "Saving..." |
*
* @param {Auth_Common_Submit_SavingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_submit_saving = /** @type {((inputs?: Auth_Common_Submit_SavingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Submit_SavingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_submit_saving(inputs)
	return __cs.auth_common_submit_saving(inputs)
});
export { auth_common_submit_saving as "auth.common.submit.saving" }
/**
* | output |
* | --- |
* | "Set new password" |
*
* @param {Auth_Common_Submit_Setnewpassword2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_submit_setnewpassword2 = /** @type {((inputs?: Auth_Common_Submit_Setnewpassword2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Submit_Setnewpassword2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_submit_setnewpassword2(inputs)
	return __cs.auth_common_submit_setnewpassword2(inputs)
});
export { auth_common_submit_setnewpassword2 as "auth.common.submit.setNewPassword" }
/**
* | output |
* | --- |
* | "Password changed!" |
*
* @param {Auth_Common_Success_Passwordchanged1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_success_passwordchanged1 = /** @type {((inputs?: Auth_Common_Success_Passwordchanged1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Success_Passwordchanged1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_success_passwordchanged1(inputs)
	return __cs.auth_common_success_passwordchanged1(inputs)
});
export { auth_common_success_passwordchanged1 as "auth.common.success.passwordChanged" }
/**
* | output |
* | --- |
* | "Your password has been successfully set. You can now sign in." |
*
* @param {Auth_Common_Success_Passwordchangeddesc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_success_passwordchangeddesc2 = /** @type {((inputs?: Auth_Common_Success_Passwordchangeddesc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Success_Passwordchangeddesc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_success_passwordchangeddesc2(inputs)
	return __cs.auth_common_success_passwordchangeddesc2(inputs)
});
export { auth_common_success_passwordchangeddesc2 as "auth.common.success.passwordChangedDesc" }
/**
* | output |
* | --- |
* | "Your password is securely encrypted and stored." |
*
* @param {Auth_Common_Success_EncryptedInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_success_encrypted = /** @type {((inputs?: Auth_Common_Success_EncryptedInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Success_EncryptedInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_success_encrypted(inputs)
	return __cs.auth_common_success_encrypted(inputs)
});
export { auth_common_success_encrypted as "auth.common.success.encrypted" }
/**
* | output |
* | --- |
* | "Tip:" |
*
* @param {Auth_Common_Tip_PrefixInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_tip_prefix = /** @type {((inputs?: Auth_Common_Tip_PrefixInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Tip_PrefixInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_common_tip_prefix(inputs)
	return __cs.auth_common_tip_prefix(inputs)
});
export { auth_common_tip_prefix as "auth.common.tip.prefix" }
/**
* | output |
* | --- |
* | "Sign In – MetaCleaner" |
*
* @param {Auth_Login_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_meta_title = /** @type {((inputs?: Auth_Login_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_meta_title(inputs)
	return __cs.auth_login_meta_title(inputs)
});
export { auth_login_meta_title as "auth.login.meta.title" }
/**
* | output |
* | --- |
* | "Don't have an account?" |
*
* @param {Auth_Login_Nav_Noaccount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_nav_noaccount1 = /** @type {((inputs?: Auth_Login_Nav_Noaccount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Nav_Noaccount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_nav_noaccount1(inputs)
	return __cs.auth_login_nav_noaccount1(inputs)
});
export { auth_login_nav_noaccount1 as "auth.login.nav.noAccount" }
/**
* | output |
* | --- |
* | "Sign up" |
*
* @param {Auth_Login_Nav_RegisterInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_nav_register = /** @type {((inputs?: Auth_Login_Nav_RegisterInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Nav_RegisterInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_nav_register(inputs)
	return __cs.auth_login_nav_register(inputs)
});
export { auth_login_nav_register as "auth.login.nav.register" }
/**
* | output |
* | --- |
* | "Protect your" |
*
* @param {Auth_Login_Branding_HeadlineInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_branding_headline = /** @type {((inputs?: Auth_Login_Branding_HeadlineInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Branding_HeadlineInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_branding_headline(inputs)
	return __cs.auth_login_branding_headline(inputs)
});
export { auth_login_branding_headline as "auth.login.branding.headline" }
/**
* | output |
* | --- |
* | "privacy" |
*
* @param {Auth_Login_Branding_Headlinehighlight1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_branding_headlinehighlight1 = /** @type {((inputs?: Auth_Login_Branding_Headlinehighlight1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Branding_Headlinehighlight1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_branding_headlinehighlight1(inputs)
	return __cs.auth_login_branding_headlinehighlight1(inputs)
});
export { auth_login_branding_headlinehighlight1 as "auth.login.branding.headlineHighlight" }
/**
* | output |
* | --- |
* | "online" |
*
* @param {Auth_Login_Branding_Headlineafter1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_branding_headlineafter1 = /** @type {((inputs?: Auth_Login_Branding_Headlineafter1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Branding_Headlineafter1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_branding_headlineafter1(inputs)
	return __cs.auth_login_branding_headlineafter1(inputs)
});
export { auth_login_branding_headlineafter1 as "auth.login.branding.headlineAfter" }
/**
* | output |
* | --- |
* | "MetaCleaner removes hidden metadata from your photos and videos. Your files leave the device without sensitive information." |
*
* @param {Auth_Login_Branding_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_branding_description = /** @type {((inputs?: Auth_Login_Branding_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Branding_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_branding_description(inputs)
	return __cs.auth_login_branding_description(inputs)
});
export { auth_login_branding_description as "auth.login.branding.description" }
/**
* | output |
* | --- |
* | "Secure processing" |
*
* @param {Auth_Login_Feature_Securetitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_securetitle1 = /** @type {((inputs?: Auth_Login_Feature_Securetitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Securetitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_feature_securetitle1(inputs)
	return __cs.auth_login_feature_securetitle1(inputs)
});
export { auth_login_feature_securetitle1 as "auth.login.feature.secureTitle" }
/**
* | output |
* | --- |
* | "Files stay private and ready to share." |
*
* @param {Auth_Login_Feature_Securedesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_securedesc1 = /** @type {((inputs?: Auth_Login_Feature_Securedesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Securedesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_feature_securedesc1(inputs)
	return __cs.auth_login_feature_securedesc1(inputs)
});
export { auth_login_feature_securedesc1 as "auth.login.feature.secureDesc" }
/**
* | output |
* | --- |
* | "E2E" |
*
* @param {Auth_Login_Feature_Securebadge1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_securebadge1 = /** @type {((inputs?: Auth_Login_Feature_Securebadge1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Securebadge1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_feature_securebadge1(inputs)
	return __cs.auth_login_feature_securebadge1(inputs)
});
export { auth_login_feature_securebadge1 as "auth.login.feature.secureBadge" }
/**
* | output |
* | --- |
* | "Fast cleaning" |
*
* @param {Auth_Login_Feature_Fasttitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_fasttitle1 = /** @type {((inputs?: Auth_Login_Feature_Fasttitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Fasttitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_feature_fasttitle1(inputs)
	return __cs.auth_login_feature_fasttitle1(inputs)
});
export { auth_login_feature_fasttitle1 as "auth.login.feature.fastTitle" }
/**
* | output |
* | --- |
* | "Hundreds of files per second" |
*
* @param {Auth_Login_Feature_Fastdesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_fastdesc1 = /** @type {((inputs?: Auth_Login_Feature_Fastdesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Fastdesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_feature_fastdesc1(inputs)
	return __cs.auth_login_feature_fastdesc1(inputs)
});
export { auth_login_feature_fastdesc1 as "auth.login.feature.fastDesc" }
/**
* | output |
* | --- |
* | "Fast" |
*
* @param {Auth_Login_Feature_Fastbadge1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_fastbadge1 = /** @type {((inputs?: Auth_Login_Feature_Fastbadge1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Fastbadge1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_feature_fastbadge1(inputs)
	return __cs.auth_login_feature_fastbadge1(inputs)
});
export { auth_login_feature_fastbadge1 as "auth.login.feature.fastBadge" }
/**
* | output |
* | --- |
* | "Multiple formats" |
*
* @param {Auth_Login_Feature_Formatstitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_formatstitle1 = /** @type {((inputs?: Auth_Login_Feature_Formatstitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Formatstitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_feature_formatstitle1(inputs)
	return __cs.auth_login_feature_formatstitle1(inputs)
});
export { auth_login_feature_formatstitle1 as "auth.login.feature.formatsTitle" }
/**
* | output |
* | --- |
* | "JPG, PNG, HEIC, MP4, MOV and more" |
*
* @param {Auth_Login_Feature_Formatsdesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_feature_formatsdesc1 = /** @type {((inputs?: Auth_Login_Feature_Formatsdesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Feature_Formatsdesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_feature_formatsdesc1(inputs)
	return __cs.auth_login_feature_formatsdesc1(inputs)
});
export { auth_login_feature_formatsdesc1 as "auth.login.feature.formatsDesc" }
/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Login_Form_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_form_title = /** @type {((inputs?: Auth_Login_Form_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Form_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_form_title(inputs)
	return __cs.auth_login_form_title(inputs)
});
export { auth_login_form_title as "auth.login.form.title" }
/**
* | output |
* | --- |
* | "Welcome back! Enter your credentials." |
*
* @param {Auth_Login_Form_SubtitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_form_subtitle = /** @type {((inputs?: Auth_Login_Form_SubtitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Form_SubtitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_form_subtitle(inputs)
	return __cs.auth_login_form_subtitle(inputs)
});
export { auth_login_form_subtitle as "auth.login.form.subtitle" }
/**
* | output |
* | --- |
* | "Continue with Google" |
*
* @param {Auth_Login_Social_GoogleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_social_google = /** @type {((inputs?: Auth_Login_Social_GoogleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Social_GoogleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_social_google(inputs)
	return __cs.auth_login_social_google(inputs)
});
export { auth_login_social_google as "auth.login.social.google" }
/**
* | output |
* | --- |
* | "Continue with Apple" |
*
* @param {Auth_Login_Social_AppleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_social_apple = /** @type {((inputs?: Auth_Login_Social_AppleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Social_AppleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_social_apple(inputs)
	return __cs.auth_login_social_apple(inputs)
});
export { auth_login_social_apple as "auth.login.social.apple" }
/**
* | output |
* | --- |
* | "or with email" |
*
* @param {Auth_Login_Divider_Oremail1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_divider_oremail1 = /** @type {((inputs?: Auth_Login_Divider_Oremail1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Divider_Oremail1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_divider_oremail1(inputs)
	return __cs.auth_login_divider_oremail1(inputs)
});
export { auth_login_divider_oremail1 as "auth.login.divider.orEmail" }
/**
* | output |
* | --- |
* | "Email address" |
*
* @param {Auth_Login_Field_Emaillabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_field_emaillabel1 = /** @type {((inputs?: Auth_Login_Field_Emaillabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Field_Emaillabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_field_emaillabel1(inputs)
	return __cs.auth_login_field_emaillabel1(inputs)
});
export { auth_login_field_emaillabel1 as "auth.login.field.emailLabel" }
/**
* | output |
* | --- |
* | "you@email.com" |
*
* @param {Auth_Login_Field_Emailplaceholder1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_field_emailplaceholder1 = /** @type {((inputs?: Auth_Login_Field_Emailplaceholder1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Field_Emailplaceholder1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_field_emailplaceholder1(inputs)
	return __cs.auth_login_field_emailplaceholder1(inputs)
});
export { auth_login_field_emailplaceholder1 as "auth.login.field.emailPlaceholder" }
/**
* | output |
* | --- |
* | "Password" |
*
* @param {Auth_Login_Field_Passwordlabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_field_passwordlabel1 = /** @type {((inputs?: Auth_Login_Field_Passwordlabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Field_Passwordlabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_field_passwordlabel1(inputs)
	return __cs.auth_login_field_passwordlabel1(inputs)
});
export { auth_login_field_passwordlabel1 as "auth.login.field.passwordLabel" }
/**
* | output |
* | --- |
* | "Forgot password?" |
*
* @param {Auth_Login_Field_Forgotpassword1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_field_forgotpassword1 = /** @type {((inputs?: Auth_Login_Field_Forgotpassword1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Field_Forgotpassword1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_field_forgotpassword1(inputs)
	return __cs.auth_login_field_forgotpassword1(inputs)
});
export { auth_login_field_forgotpassword1 as "auth.login.field.forgotPassword" }
/**
* | output |
* | --- |
* | "Remember me on this device" |
*
* @param {Auth_Login_Field_RememberInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_field_remember = /** @type {((inputs?: Auth_Login_Field_RememberInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Field_RememberInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_field_remember(inputs)
	return __cs.auth_login_field_remember(inputs)
});
export { auth_login_field_remember as "auth.login.field.remember" }
/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Login_Submit_IdleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_submit_idle = /** @type {((inputs?: Auth_Login_Submit_IdleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Submit_IdleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_submit_idle(inputs)
	return __cs.auth_login_submit_idle(inputs)
});
export { auth_login_submit_idle as "auth.login.submit.idle" }
/**
* | output |
* | --- |
* | "Signing in..." |
*
* @param {Auth_Login_Submit_LoadingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_submit_loading = /** @type {((inputs?: Auth_Login_Submit_LoadingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Submit_LoadingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_submit_loading(inputs)
	return __cs.auth_login_submit_loading(inputs)
});
export { auth_login_submit_loading as "auth.login.submit.loading" }
/**
* | output |
* | --- |
* | "Signed in!" |
*
* @param {Auth_Login_Submit_SuccessInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_submit_success = /** @type {((inputs?: Auth_Login_Submit_SuccessInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Submit_SuccessInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_submit_success(inputs)
	return __cs.auth_login_submit_success(inputs)
});
export { auth_login_submit_success as "auth.login.submit.success" }
/**
* | output |
* | --- |
* | "Don't have an account?" |
*
* @param {Auth_Login_Footer_Noaccount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_footer_noaccount1 = /** @type {((inputs?: Auth_Login_Footer_Noaccount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Footer_Noaccount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_footer_noaccount1(inputs)
	return __cs.auth_login_footer_noaccount1(inputs)
});
export { auth_login_footer_noaccount1 as "auth.login.footer.noAccount" }
/**
* | output |
* | --- |
* | "Sign up for free" |
*
* @param {Auth_Login_Footer_Registerfree1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_footer_registerfree1 = /** @type {((inputs?: Auth_Login_Footer_Registerfree1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Footer_Registerfree1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_footer_registerfree1(inputs)
	return __cs.auth_login_footer_registerfree1(inputs)
});
export { auth_login_footer_registerfree1 as "auth.login.footer.registerFree" }
/**
* | output |
* | --- |
* | "Password must be at least 6 characters." |
*
* @param {Auth_Login_Validation_Passwordshort1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_validation_passwordshort1 = /** @type {((inputs?: Auth_Login_Validation_Passwordshort1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Validation_Passwordshort1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_validation_passwordshort1(inputs)
	return __cs.auth_login_validation_passwordshort1(inputs)
});
export { auth_login_validation_passwordshort1 as "auth.login.validation.passwordShort" }
/**
* | output |
* | --- |
* | "Please enter your password." |
*
* @param {Auth_Login_Validation_Passwordempty1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_validation_passwordempty1 = /** @type {((inputs?: Auth_Login_Validation_Passwordempty1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Validation_Passwordempty1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_validation_passwordempty1(inputs)
	return __cs.auth_login_validation_passwordempty1(inputs)
});
export { auth_login_validation_passwordempty1 as "auth.login.validation.passwordEmpty" }
/**
* | output |
* | --- |
* | "or" |
*
* @param {Auth_Login_Magic_DividerInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_magic_divider = /** @type {((inputs?: Auth_Login_Magic_DividerInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Magic_DividerInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_magic_divider(inputs)
	return __cs.auth_login_magic_divider(inputs)
});
export { auth_login_magic_divider as "auth.login.magic.divider" }
/**
* | output |
* | --- |
* | "Send magic link" |
*
* @param {Auth_Login_Magic_SendInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_magic_send = /** @type {((inputs?: Auth_Login_Magic_SendInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Magic_SendInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_magic_send(inputs)
	return __cs.auth_login_magic_send(inputs)
});
export { auth_login_magic_send as "auth.login.magic.send" }
/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Auth_Login_Magic_SendingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_magic_sending = /** @type {((inputs?: Auth_Login_Magic_SendingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Magic_SendingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_magic_sending(inputs)
	return __cs.auth_login_magic_sending(inputs)
});
export { auth_login_magic_sending as "auth.login.magic.sending" }
/**
* | output |
* | --- |
* | "Check your email" |
*
* @param {Auth_Login_Magic_Successtitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_magic_successtitle1 = /** @type {((inputs?: Auth_Login_Magic_Successtitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Magic_Successtitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_magic_successtitle1(inputs)
	return __cs.auth_login_magic_successtitle1(inputs)
});
export { auth_login_magic_successtitle1 as "auth.login.magic.successTitle" }
/**
* | output |
* | --- |
* | "We sent a magic link to" |
*
* @param {Auth_Login_Magic_Successdesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_magic_successdesc1 = /** @type {((inputs?: Auth_Login_Magic_Successdesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Magic_Successdesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_magic_successdesc1(inputs)
	return __cs.auth_login_magic_successdesc1(inputs)
});
export { auth_login_magic_successdesc1 as "auth.login.magic.successDesc" }
/**
* | output |
* | --- |
* | "Back to sign in" |
*
* @param {Auth_Login_Magic_Backtologin2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_login_magic_backtologin2 = /** @type {((inputs?: Auth_Login_Magic_Backtologin2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Login_Magic_Backtologin2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_login_magic_backtologin2(inputs)
	return __cs.auth_login_magic_backtologin2(inputs)
});
export { auth_login_magic_backtologin2 as "auth.login.magic.backToLogin" }
/**
* | output |
* | --- |
* | "Create Account – MetaCleaner" |
*
* @param {Auth_Register_Meta_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_meta_title = /** @type {((inputs?: Auth_Register_Meta_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Meta_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_meta_title(inputs)
	return __cs.auth_register_meta_title(inputs)
});
export { auth_register_meta_title as "auth.register.meta.title" }
/**
* | output |
* | --- |
* | "Already have an account?" |
*
* @param {Auth_Register_Nav_Hasaccount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_nav_hasaccount1 = /** @type {((inputs?: Auth_Register_Nav_Hasaccount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Nav_Hasaccount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_nav_hasaccount1(inputs)
	return __cs.auth_register_nav_hasaccount1(inputs)
});
export { auth_register_nav_hasaccount1 as "auth.register.nav.hasAccount" }
/**
* | output |
* | --- |
* | "Free forever · No credit card" |
*
* @param {Auth_Register_Badge_Freeforever1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_badge_freeforever1 = /** @type {((inputs?: Auth_Register_Badge_Freeforever1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Badge_Freeforever1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_badge_freeforever1(inputs)
	return __cs.auth_register_badge_freeforever1(inputs)
});
export { auth_register_badge_freeforever1 as "auth.register.badge.freeForever" }
/**
* | output |
* | --- |
* | "Start protecting" |
*
* @param {Auth_Register_Branding_HeadlineInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_branding_headline = /** @type {((inputs?: Auth_Register_Branding_HeadlineInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Branding_HeadlineInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_branding_headline(inputs)
	return __cs.auth_register_branding_headline(inputs)
});
export { auth_register_branding_headline as "auth.register.branding.headline" }
/**
* | output |
* | --- |
* | "privacy" |
*
* @param {Auth_Register_Branding_Headlinehighlight1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_branding_headlinehighlight1 = /** @type {((inputs?: Auth_Register_Branding_Headlinehighlight1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Branding_Headlinehighlight1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_branding_headlinehighlight1(inputs)
	return __cs.auth_register_branding_headlinehighlight1(inputs)
});
export { auth_register_branding_headlinehighlight1 as "auth.register.branding.headlineHighlight" }
/**
* | output |
* | --- |
* | "Create a free account and start removing metadata from photos and videos. No hidden fees, no tracking." |
*
* @param {Auth_Register_Branding_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_branding_description = /** @type {((inputs?: Auth_Register_Branding_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Branding_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_branding_description(inputs)
	return __cs.auth_register_branding_description(inputs)
});
export { auth_register_branding_description as "auth.register.branding.description" }
/**
* | output |
* | --- |
* | "Choose your plan" |
*
* @param {Auth_Register_Plan_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_title = /** @type {((inputs?: Auth_Register_Plan_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_plan_title(inputs)
	return __cs.auth_register_plan_title(inputs)
});
export { auth_register_plan_title as "auth.register.plan.title" }
/**
* | output |
* | --- |
* | "Free" |
*
* @param {Auth_Register_Plan_Freename1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_freename1 = /** @type {((inputs?: Auth_Register_Plan_Freename1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Freename1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_plan_freename1(inputs)
	return __cs.auth_register_plan_freename1(inputs)
});
export { auth_register_plan_freename1 as "auth.register.plan.freeName" }
/**
* | output |
* | --- |
* | "Free" |
*
* @param {Auth_Register_Plan_Freebadge1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_freebadge1 = /** @type {((inputs?: Auth_Register_Plan_Freebadge1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Freebadge1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_plan_freebadge1(inputs)
	return __cs.auth_register_plan_freebadge1(inputs)
});
export { auth_register_plan_freebadge1 as "auth.register.plan.freeBadge" }
/**
* | output |
* | --- |
* | "50 files / month · JPG, PNG" |
*
* @param {Auth_Register_Plan_Freedesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_freedesc1 = /** @type {((inputs?: Auth_Register_Plan_Freedesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Freedesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_plan_freedesc1(inputs)
	return __cs.auth_register_plan_freedesc1(inputs)
});
export { auth_register_plan_freedesc1 as "auth.register.plan.freeDesc" }
/**
* | output |
* | --- |
* | "Pro" |
*
* @param {Auth_Register_Plan_Proname1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_proname1 = /** @type {((inputs?: Auth_Register_Plan_Proname1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Proname1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_plan_proname1(inputs)
	return __cs.auth_register_plan_proname1(inputs)
});
export { auth_register_plan_proname1 as "auth.register.plan.proName" }
/**
* | output |
* | --- |
* | "Most popular" |
*
* @param {Auth_Register_Plan_Probadge1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_probadge1 = /** @type {((inputs?: Auth_Register_Plan_Probadge1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Probadge1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_plan_probadge1(inputs)
	return __cs.auth_register_plan_probadge1(inputs)
});
export { auth_register_plan_probadge1 as "auth.register.plan.proBadge" }
/**
* | output |
* | --- |
* | "Unlimited · All formats · Priority" |
*
* @param {Auth_Register_Plan_Prodesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_prodesc1 = /** @type {((inputs?: Auth_Register_Plan_Prodesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Prodesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_plan_prodesc1(inputs)
	return __cs.auth_register_plan_prodesc1(inputs)
});
export { auth_register_plan_prodesc1 as "auth.register.plan.proDesc" }
/**
* | output |
* | --- |
* | "Choose plan" |
*
* @param {Auth_Register_Plan_Titlemobile1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_titlemobile1 = /** @type {((inputs?: Auth_Register_Plan_Titlemobile1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Titlemobile1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_plan_titlemobile1(inputs)
	return __cs.auth_register_plan_titlemobile1(inputs)
});
export { auth_register_plan_titlemobile1 as "auth.register.plan.titleMobile" }
/**
* | output |
* | --- |
* | "No credit card required" |
*
* @param {Auth_Register_Benefit_Nocard1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_benefit_nocard1 = /** @type {((inputs?: Auth_Register_Benefit_Nocard1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Benefit_Nocard1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_benefit_nocard1(inputs)
	return __cs.auth_register_benefit_nocard1(inputs)
});
export { auth_register_benefit_nocard1 as "auth.register.benefit.noCard" }
/**
* | output |
* | --- |
* | "GDPR compliant · We never share data" |
*
* @param {Auth_Register_Benefit_GdprInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_benefit_gdpr = /** @type {((inputs?: Auth_Register_Benefit_GdprInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Benefit_GdprInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_benefit_gdpr(inputs)
	return __cs.auth_register_benefit_gdpr(inputs)
});
export { auth_register_benefit_gdpr as "auth.register.benefit.gdpr" }
/**
* | output |
* | --- |
* | "Secure E2E encryption" |
*
* @param {Auth_Register_Benefit_E2eInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_benefit_e2e = /** @type {((inputs?: Auth_Register_Benefit_E2eInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Benefit_E2eInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_benefit_e2e(inputs)
	return __cs.auth_register_benefit_e2e(inputs)
});
export { auth_register_benefit_e2e as "auth.register.benefit.e2e" }
/**
* | output |
* | --- |
* | "Cancel anytime, no obligations" |
*
* @param {Auth_Register_Benefit_CancelInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_benefit_cancel = /** @type {((inputs?: Auth_Register_Benefit_CancelInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Benefit_CancelInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_benefit_cancel(inputs)
	return __cs.auth_register_benefit_cancel(inputs)
});
export { auth_register_benefit_cancel as "auth.register.benefit.cancel" }
/**
* | output |
* | --- |
* | "Remove metadata from photos and videos. No fees, no tracking." |
*
* @param {Auth_Register_Mobile_DescriptionInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_mobile_description = /** @type {((inputs?: Auth_Register_Mobile_DescriptionInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Mobile_DescriptionInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_mobile_description(inputs)
	return __cs.auth_register_mobile_description(inputs)
});
export { auth_register_mobile_description as "auth.register.mobile.description" }
/**
* | output |
* | --- |
* | "Create account" |
*
* @param {Auth_Register_Form_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_form_title = /** @type {((inputs?: Auth_Register_Form_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Form_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_form_title(inputs)
	return __cs.auth_register_form_title(inputs)
});
export { auth_register_form_title as "auth.register.form.title" }
/**
* | output |
* | --- |
* | "Sign up for free in less than a minute." |
*
* @param {Auth_Register_Form_SubtitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_form_subtitle = /** @type {((inputs?: Auth_Register_Form_SubtitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Form_SubtitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_form_subtitle(inputs)
	return __cs.auth_register_form_subtitle(inputs)
});
export { auth_register_form_subtitle as "auth.register.form.subtitle" }
/**
* | output |
* | --- |
* | "Sign up with Google" |
*
* @param {Auth_Register_Social_GoogleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_social_google = /** @type {((inputs?: Auth_Register_Social_GoogleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Social_GoogleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_social_google(inputs)
	return __cs.auth_register_social_google(inputs)
});
export { auth_register_social_google as "auth.register.social.google" }
/**
* | output |
* | --- |
* | "Sign up with Apple" |
*
* @param {Auth_Register_Social_AppleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_social_apple = /** @type {((inputs?: Auth_Register_Social_AppleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Social_AppleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_social_apple(inputs)
	return __cs.auth_register_social_apple(inputs)
});
export { auth_register_social_apple as "auth.register.social.apple" }
/**
* | output |
* | --- |
* | "First name" |
*
* @param {Auth_Register_Field_Firstname1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_firstname1 = /** @type {((inputs?: Auth_Register_Field_Firstname1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Firstname1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_field_firstname1(inputs)
	return __cs.auth_register_field_firstname1(inputs)
});
export { auth_register_field_firstname1 as "auth.register.field.firstName" }
/**
* | output |
* | --- |
* | "John" |
*
* @param {Auth_Register_Field_Firstnameplaceholder2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_firstnameplaceholder2 = /** @type {((inputs?: Auth_Register_Field_Firstnameplaceholder2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Firstnameplaceholder2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_field_firstnameplaceholder2(inputs)
	return __cs.auth_register_field_firstnameplaceholder2(inputs)
});
export { auth_register_field_firstnameplaceholder2 as "auth.register.field.firstNamePlaceholder" }
/**
* | output |
* | --- |
* | "Last name" |
*
* @param {Auth_Register_Field_Lastname1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_lastname1 = /** @type {((inputs?: Auth_Register_Field_Lastname1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Lastname1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_field_lastname1(inputs)
	return __cs.auth_register_field_lastname1(inputs)
});
export { auth_register_field_lastname1 as "auth.register.field.lastName" }
/**
* | output |
* | --- |
* | "Doe" |
*
* @param {Auth_Register_Field_Lastnameplaceholder2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_lastnameplaceholder2 = /** @type {((inputs?: Auth_Register_Field_Lastnameplaceholder2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Lastnameplaceholder2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_field_lastnameplaceholder2(inputs)
	return __cs.auth_register_field_lastnameplaceholder2(inputs)
});
export { auth_register_field_lastnameplaceholder2 as "auth.register.field.lastNamePlaceholder" }
/**
* | output |
* | --- |
* | "Min. 8 characters" |
*
* @param {Auth_Register_Field_Passwordplaceholder1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_passwordplaceholder1 = /** @type {((inputs?: Auth_Register_Field_Passwordplaceholder1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Passwordplaceholder1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_field_passwordplaceholder1(inputs)
	return __cs.auth_register_field_passwordplaceholder1(inputs)
});
export { auth_register_field_passwordplaceholder1 as "auth.register.field.passwordPlaceholder" }
/**
* | output |
* | --- |
* | "Repeat password" |
*
* @param {Auth_Register_Field_Confirmplaceholder1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_field_confirmplaceholder1 = /** @type {((inputs?: Auth_Register_Field_Confirmplaceholder1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Field_Confirmplaceholder1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_field_confirmplaceholder1(inputs)
	return __cs.auth_register_field_confirmplaceholder1(inputs)
});
export { auth_register_field_confirmplaceholder1 as "auth.register.field.confirmPlaceholder" }
/**
* | output |
* | --- |
* | "I agree to the" |
*
* @param {Auth_Register_Terms_AgreeInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_terms_agree = /** @type {((inputs?: Auth_Register_Terms_AgreeInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Terms_AgreeInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_terms_agree(inputs)
	return __cs.auth_register_terms_agree(inputs)
});
export { auth_register_terms_agree as "auth.register.terms.agree" }
/**
* | output |
* | --- |
* | "terms of use" |
*
* @param {Auth_Register_Terms_TosInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_terms_tos = /** @type {((inputs?: Auth_Register_Terms_TosInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Terms_TosInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_terms_tos(inputs)
	return __cs.auth_register_terms_tos(inputs)
});
export { auth_register_terms_tos as "auth.register.terms.tos" }
/**
* | output |
* | --- |
* | "and" |
*
* @param {Auth_Register_Terms_AndInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_terms_and = /** @type {((inputs?: Auth_Register_Terms_AndInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Terms_AndInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_terms_and(inputs)
	return __cs.auth_register_terms_and(inputs)
});
export { auth_register_terms_and as "auth.register.terms.and" }
/**
* | output |
* | --- |
* | "privacy policy" |
*
* @param {Auth_Register_Terms_PrivacyInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_terms_privacy = /** @type {((inputs?: Auth_Register_Terms_PrivacyInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Terms_PrivacyInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_terms_privacy(inputs)
	return __cs.auth_register_terms_privacy(inputs)
});
export { auth_register_terms_privacy as "auth.register.terms.privacy" }
/**
* | output |
* | --- |
* | "Create free account" |
*
* @param {Auth_Register_Submit_IdleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_submit_idle = /** @type {((inputs?: Auth_Register_Submit_IdleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Submit_IdleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_submit_idle(inputs)
	return __cs.auth_register_submit_idle(inputs)
});
export { auth_register_submit_idle as "auth.register.submit.idle" }
/**
* | output |
* | --- |
* | "Creating account..." |
*
* @param {Auth_Register_Submit_LoadingInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_submit_loading = /** @type {((inputs?: Auth_Register_Submit_LoadingInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Submit_LoadingInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_submit_loading(inputs)
	return __cs.auth_register_submit_loading(inputs)
});
export { auth_register_submit_loading as "auth.register.submit.loading" }
/**
* | output |
* | --- |
* | "Account created!" |
*
* @param {Auth_Register_Submit_SuccessInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_submit_success = /** @type {((inputs?: Auth_Register_Submit_SuccessInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Submit_SuccessInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_submit_success(inputs)
	return __cs.auth_register_submit_success(inputs)
});
export { auth_register_submit_success as "auth.register.submit.success" }
/**
* | output |
* | --- |
* | "Already have an account?" |
*
* @param {Auth_Register_Footer_Hasaccount1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_footer_hasaccount1 = /** @type {((inputs?: Auth_Register_Footer_Hasaccount1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Footer_Hasaccount1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_footer_hasaccount1(inputs)
	return __cs.auth_register_footer_hasaccount1(inputs)
});
export { auth_register_footer_hasaccount1 as "auth.register.footer.hasAccount" }
/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Register_Footer_LoginInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_footer_login = /** @type {((inputs?: Auth_Register_Footer_LoginInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Footer_LoginInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_footer_login(inputs)
	return __cs.auth_register_footer_login(inputs)
});
export { auth_register_footer_login as "auth.register.footer.login" }
/**
* | output |
* | --- |
* | "Cleaned" |
*
* @param {Auth_Register_Stats_Cleanedlabel1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_stats_cleanedlabel1 = /** @type {((inputs?: Auth_Register_Stats_Cleanedlabel1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Stats_Cleanedlabel1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_stats_cleanedlabel1(inputs)
	return __cs.auth_register_stats_cleanedlabel1(inputs)
});
export { auth_register_stats_cleanedlabel1 as "auth.register.stats.cleanedLabel" }
/**
* | output |
* | --- |
* | "Please enter your first name." |
*
* @param {Auth_Register_Validation_Firstnamerequired2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_validation_firstnamerequired2 = /** @type {((inputs?: Auth_Register_Validation_Firstnamerequired2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Validation_Firstnamerequired2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_validation_firstnamerequired2(inputs)
	return __cs.auth_register_validation_firstnamerequired2(inputs)
});
export { auth_register_validation_firstnamerequired2 as "auth.register.validation.firstNameRequired" }
/**
* | output |
* | --- |
* | "Please enter your last name." |
*
* @param {Auth_Register_Validation_Lastnamerequired2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_validation_lastnamerequired2 = /** @type {((inputs?: Auth_Register_Validation_Lastnamerequired2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Validation_Lastnamerequired2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_validation_lastnamerequired2(inputs)
	return __cs.auth_register_validation_lastnamerequired2(inputs)
});
export { auth_register_validation_lastnamerequired2 as "auth.register.validation.lastNameRequired" }
/**
* | output |
* | --- |
* | "You must agree to the terms." |
*
* @param {Auth_Register_Validation_Termsrequired1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_validation_termsrequired1 = /** @type {((inputs?: Auth_Register_Validation_Termsrequired1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Validation_Termsrequired1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_register_validation_termsrequired1(inputs)
	return __cs.auth_register_validation_termsrequired1(inputs)
});
export { auth_register_validation_termsrequired1 as "auth.register.validation.termsRequired" }
/**
* | output |
* | --- |
* | "Verify Email – MetaCleaner" |
*
* @param {Auth_Checkemail_Meta_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_meta_title1 = /** @type {((inputs?: Auth_Checkemail_Meta_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Meta_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_meta_title1(inputs)
	return __cs.auth_checkemail_meta_title1(inputs)
});
export { auth_checkemail_meta_title1 as "auth.checkEmail.meta.title" }
/**
* | output |
* | --- |
* | "Account created · Last step" |
*
* @param {Auth_Checkemail_Badge_Created1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_badge_created1 = /** @type {((inputs?: Auth_Checkemail_Badge_Created1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Badge_Created1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_badge_created1(inputs)
	return __cs.auth_checkemail_badge_created1(inputs)
});
export { auth_checkemail_badge_created1 as "auth.checkEmail.badge.created" }
/**
* | output |
* | --- |
* | "Almost done!" |
*
* @param {Auth_Checkemail_Heading_Almostdone2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_heading_almostdone2 = /** @type {((inputs?: Auth_Checkemail_Heading_Almostdone2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Heading_Almostdone2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_heading_almostdone2(inputs)
	return __cs.auth_checkemail_heading_almostdone2(inputs)
});
export { auth_checkemail_heading_almostdone2 as "auth.checkEmail.heading.almostDone" }
/**
* | output |
* | --- |
* | "Verify your" |
*
* @param {Auth_Checkemail_Heading_Verify1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_heading_verify1 = /** @type {((inputs?: Auth_Checkemail_Heading_Verify1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Heading_Verify1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_heading_verify1(inputs)
	return __cs.auth_checkemail_heading_verify1(inputs)
});
export { auth_checkemail_heading_verify1 as "auth.checkEmail.heading.verify" }
/**
* | output |
* | --- |
* | "email" |
*
* @param {Auth_Checkemail_Heading_Emailhighlight2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_heading_emailhighlight2 = /** @type {((inputs?: Auth_Checkemail_Heading_Emailhighlight2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Heading_Emailhighlight2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_heading_emailhighlight2(inputs)
	return __cs.auth_checkemail_heading_emailhighlight2(inputs)
});
export { auth_checkemail_heading_emailhighlight2 as "auth.checkEmail.heading.emailHighlight" }
/**
* | output |
* | --- |
* | "We sent you a verification link..." |
*
* @param {Auth_Checkemail_Heading_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_heading_description1 = /** @type {((inputs?: Auth_Checkemail_Heading_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Heading_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_heading_description1(inputs)
	return __cs.auth_checkemail_heading_description1(inputs)
});
export { auth_checkemail_heading_description1 as "auth.checkEmail.heading.description" }
/**
* | output |
* | --- |
* | "Account created" |
*
* @param {Auth_Checkemail_Step_Accountcreated2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_accountcreated2 = /** @type {((inputs?: Auth_Checkemail_Step_Accountcreated2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Accountcreated2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_step_accountcreated2(inputs)
	return __cs.auth_checkemail_step_accountcreated2(inputs)
});
export { auth_checkemail_step_accountcreated2 as "auth.checkEmail.step.accountCreated" }
/**
* | output |
* | --- |
* | "Your details were securely saved" |
*
* @param {Auth_Checkemail_Step_Accountcreateddesc3Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_accountcreateddesc3 = /** @type {((inputs?: Auth_Checkemail_Step_Accountcreateddesc3Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Accountcreateddesc3Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_step_accountcreateddesc3(inputs)
	return __cs.auth_checkemail_step_accountcreateddesc3(inputs)
});
export { auth_checkemail_step_accountcreateddesc3 as "auth.checkEmail.step.accountCreatedDesc" }
/**
* | output |
* | --- |
* | "Email verification" |
*
* @param {Auth_Checkemail_Step_Verifyemail2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_verifyemail2 = /** @type {((inputs?: Auth_Checkemail_Step_Verifyemail2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Verifyemail2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_step_verifyemail2(inputs)
	return __cs.auth_checkemail_step_verifyemail2(inputs)
});
export { auth_checkemail_step_verifyemail2 as "auth.checkEmail.step.verifyEmail" }
/**
* | output |
* | --- |
* | "Current step" |
*
* @param {Auth_Checkemail_Step_Currentstep2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_currentstep2 = /** @type {((inputs?: Auth_Checkemail_Step_Currentstep2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Currentstep2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_step_currentstep2(inputs)
	return __cs.auth_checkemail_step_currentstep2(inputs)
});
export { auth_checkemail_step_currentstep2 as "auth.checkEmail.step.currentStep" }
/**
* | output |
* | --- |
* | "Click the link in the email" |
*
* @param {Auth_Checkemail_Step_Clicklink2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_clicklink2 = /** @type {((inputs?: Auth_Checkemail_Step_Clicklink2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Clicklink2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_step_clicklink2(inputs)
	return __cs.auth_checkemail_step_clicklink2(inputs)
});
export { auth_checkemail_step_clicklink2 as "auth.checkEmail.step.clickLink" }
/**
* | output |
* | --- |
* | "Start using MetaCleaner" |
*
* @param {Auth_Checkemail_Step_Startusing2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_startusing2 = /** @type {((inputs?: Auth_Checkemail_Step_Startusing2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Startusing2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_step_startusing2(inputs)
	return __cs.auth_checkemail_step_startusing2(inputs)
});
export { auth_checkemail_step_startusing2 as "auth.checkEmail.step.startUsing" }
/**
* | output |
* | --- |
* | "Full access to all features" |
*
* @param {Auth_Checkemail_Step_Fullaccess2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_fullaccess2 = /** @type {((inputs?: Auth_Checkemail_Step_Fullaccess2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Fullaccess2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_step_fullaccess2(inputs)
	return __cs.auth_checkemail_step_fullaccess2(inputs)
});
export { auth_checkemail_step_fullaccess2 as "auth.checkEmail.step.fullAccess" }
/**
* | output |
* | --- |
* | "Check your email" |
*
* @param {Auth_Checkemail_Card_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_card_title1 = /** @type {((inputs?: Auth_Checkemail_Card_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Card_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_card_title1(inputs)
	return __cs.auth_checkemail_card_title1(inputs)
});
export { auth_checkemail_card_title1 as "auth.checkEmail.card.title" }
/**
* | output |
* | --- |
* | "We sent a verification link to" |
*
* @param {Auth_Checkemail_Card_Sentto2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_card_sentto2 = /** @type {((inputs?: Auth_Checkemail_Card_Sentto2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Card_Sentto2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_card_sentto2(inputs)
	return __cs.auth_checkemail_card_sentto2(inputs)
});
export { auth_checkemail_card_sentto2 as "auth.checkEmail.card.sentTo" }
/**
* | output |
* | --- |
* | "waiting for verification" |
*
* @param {Auth_Checkemail_Divider_Waiting1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_divider_waiting1 = /** @type {((inputs?: Auth_Checkemail_Divider_Waiting1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Divider_Waiting1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_divider_waiting1(inputs)
	return __cs.auth_checkemail_divider_waiting1(inputs)
});
export { auth_checkemail_divider_waiting1 as "auth.checkEmail.divider.waiting" }
/**
* | output |
* | --- |
* | "Waiting for confirmation" |
*
* @param {Auth_Checkemail_Waiting_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_waiting_title1 = /** @type {((inputs?: Auth_Checkemail_Waiting_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Waiting_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_waiting_title1(inputs)
	return __cs.auth_checkemail_waiting_title1(inputs)
});
export { auth_checkemail_waiting_title1 as "auth.checkEmail.waiting.title" }
/**
* | output |
* | --- |
* | "This page refreshes automatically" |
*
* @param {Auth_Checkemail_Waiting_Autorefresh2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_waiting_autorefresh2 = /** @type {((inputs?: Auth_Checkemail_Waiting_Autorefresh2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Waiting_Autorefresh2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_waiting_autorefresh2(inputs)
	return __cs.auth_checkemail_waiting_autorefresh2(inputs)
});
export { auth_checkemail_waiting_autorefresh2 as "auth.checkEmail.waiting.autoRefresh" }
/**
* | output |
* | --- |
* | "Link validity" |
*
* @param {Auth_Checkemail_Progress_Linkvalidity2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_progress_linkvalidity2 = /** @type {((inputs?: Auth_Checkemail_Progress_Linkvalidity2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Progress_Linkvalidity2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_progress_linkvalidity2(inputs)
	return __cs.auth_checkemail_progress_linkvalidity2(inputs)
});
export { auth_checkemail_progress_linkvalidity2 as "auth.checkEmail.progress.linkValidity" }
/**
* | output |
* | --- |
* | "Link expires in 24 hours" |
*
* @param {Auth_Checkemail_Progress_Expiresin24h2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_progress_expiresin24h2 = /** @type {((inputs?: Auth_Checkemail_Progress_Expiresin24h2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Progress_Expiresin24h2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_progress_expiresin24h2(inputs)
	return __cs.auth_checkemail_progress_expiresin24h2(inputs)
});
export { auth_checkemail_progress_expiresin24h2 as "auth.checkEmail.progress.expiresIn24h" }
/**
* | output |
* | --- |
* | "or" |
*
* @param {Auth_Checkemail_Divider_Or1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_divider_or1 = /** @type {((inputs?: Auth_Checkemail_Divider_Or1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Divider_Or1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_divider_or1(inputs)
	return __cs.auth_checkemail_divider_or1(inputs)
});
export { auth_checkemail_divider_or1 as "auth.checkEmail.divider.or" }
/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Auth_Checkemail_Resend_Loading1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_resend_loading1 = /** @type {((inputs?: Auth_Checkemail_Resend_Loading1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Resend_Loading1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_resend_loading1(inputs)
	return __cs.auth_checkemail_resend_loading1(inputs)
});
export { auth_checkemail_resend_loading1 as "auth.checkEmail.resend.loading" }
/**
* | output |
* | --- |
* | "Resend email" |
*
* @param {Auth_Checkemail_Resend_Idle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_resend_idle1 = /** @type {((inputs?: Auth_Checkemail_Resend_Idle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Resend_Idle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_resend_idle1(inputs)
	return __cs.auth_checkemail_resend_idle1(inputs)
});
export { auth_checkemail_resend_idle1 as "auth.checkEmail.resend.idle" }
/**
* | output |
* | --- |
* | "Change email address" |
*
* @param {Auth_Checkemail_Changeemail2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_changeemail2 = /** @type {((inputs?: Auth_Checkemail_Changeemail2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Changeemail2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_changeemail2(inputs)
	return __cs.auth_checkemail_changeemail2(inputs)
});
export { auth_checkemail_changeemail2 as "auth.checkEmail.changeEmail" }
/**
* | output |
* | --- |
* | "Can't find the email?" |
*
* @param {Auth_Checkemail_Tips_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_title1 = /** @type {((inputs?: Auth_Checkemail_Tips_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_tips_title1(inputs)
	return __cs.auth_checkemail_tips_title1(inputs)
});
export { auth_checkemail_tips_title1 as "auth.checkEmail.tips.title" }
/**
* | output |
* | --- |
* | "Check the" |
*
* @param {Auth_Checkemail_Tips_Checkfolder2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_checkfolder2 = /** @type {((inputs?: Auth_Checkemail_Tips_Checkfolder2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Checkfolder2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_tips_checkfolder2(inputs)
	return __cs.auth_checkemail_tips_checkfolder2(inputs)
});
export { auth_checkemail_tips_checkfolder2 as "auth.checkEmail.tips.checkFolder" }
/**
* | output |
* | --- |
* | "Spam" |
*
* @param {Auth_Checkemail_Tips_Spam1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_spam1 = /** @type {((inputs?: Auth_Checkemail_Tips_Spam1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Spam1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_tips_spam1(inputs)
	return __cs.auth_checkemail_tips_spam1(inputs)
});
export { auth_checkemail_tips_spam1 as "auth.checkEmail.tips.spam" }
/**
* | output |
* | --- |
* | "Bulk email" |
*
* @param {Auth_Checkemail_Tips_Bulk1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_bulk1 = /** @type {((inputs?: Auth_Checkemail_Tips_Bulk1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Bulk1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_tips_bulk1(inputs)
	return __cs.auth_checkemail_tips_bulk1(inputs)
});
export { auth_checkemail_tips_bulk1 as "auth.checkEmail.tips.bulk" }
/**
* | output |
* | --- |
* | "Email may arrive in" |
*
* @param {Auth_Checkemail_Tips_Delay1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_delay1 = /** @type {((inputs?: Auth_Checkemail_Tips_Delay1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Delay1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_tips_delay1(inputs)
	return __cs.auth_checkemail_tips_delay1(inputs)
});
export { auth_checkemail_tips_delay1 as "auth.checkEmail.tips.delay" }
/**
* | output |
* | --- |
* | "2–3 minutes" |
*
* @param {Auth_Checkemail_Tips_Delaytime2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_delaytime2 = /** @type {((inputs?: Auth_Checkemail_Tips_Delaytime2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Delaytime2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_tips_delaytime2(inputs)
	return __cs.auth_checkemail_tips_delaytime2(inputs)
});
export { auth_checkemail_tips_delaytime2 as "auth.checkEmail.tips.delayTime" }
/**
* | output |
* | --- |
* | "Link is valid for" |
*
* @param {Auth_Checkemail_Tips_Validfor2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_validfor2 = /** @type {((inputs?: Auth_Checkemail_Tips_Validfor2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Validfor2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_tips_validfor2(inputs)
	return __cs.auth_checkemail_tips_validfor2(inputs)
});
export { auth_checkemail_tips_validfor2 as "auth.checkEmail.tips.validFor" }
/**
* | output |
* | --- |
* | "24 hours" |
*
* @param {Auth_Checkemail_Tips_Validtime2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_tips_validtime2 = /** @type {((inputs?: Auth_Checkemail_Tips_Validtime2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Tips_Validtime2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_tips_validtime2(inputs)
	return __cs.auth_checkemail_tips_validtime2(inputs)
});
export { auth_checkemail_tips_validtime2 as "auth.checkEmail.tips.validTime" }
/**
* | output |
* | --- |
* | "Account created" |
*
* @param {Auth_Checkemail_Mobile_Stepcreated2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_mobile_stepcreated2 = /** @type {((inputs?: Auth_Checkemail_Mobile_Stepcreated2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Mobile_Stepcreated2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_mobile_stepcreated2(inputs)
	return __cs.auth_checkemail_mobile_stepcreated2(inputs)
});
export { auth_checkemail_mobile_stepcreated2 as "auth.checkEmail.mobile.stepCreated" }
/**
* | output |
* | --- |
* | "Email verification" |
*
* @param {Auth_Checkemail_Mobile_Stepverify2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_mobile_stepverify2 = /** @type {((inputs?: Auth_Checkemail_Mobile_Stepverify2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Mobile_Stepverify2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_mobile_stepverify2(inputs)
	return __cs.auth_checkemail_mobile_stepverify2(inputs)
});
export { auth_checkemail_mobile_stepverify2 as "auth.checkEmail.mobile.stepVerify" }
/**
* | output |
* | --- |
* | "Start app" |
*
* @param {Auth_Checkemail_Mobile_Stepstart2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_mobile_stepstart2 = /** @type {((inputs?: Auth_Checkemail_Mobile_Stepstart2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Mobile_Stepstart2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_mobile_stepstart2(inputs)
	return __cs.auth_checkemail_mobile_stepstart2(inputs)
});
export { auth_checkemail_mobile_stepstart2 as "auth.checkEmail.mobile.stepStart" }
/**
* | output |
* | --- |
* | "Email resent!" |
*
* @param {Auth_Checkemail_Toast_Resent1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_toast_resent1 = /** @type {((inputs?: Auth_Checkemail_Toast_Resent1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Toast_Resent1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkemail_toast_resent1(inputs)
	return __cs.auth_checkemail_toast_resent1(inputs)
});
export { auth_checkemail_toast_resent1 as "auth.checkEmail.toast.resent" }
/**
* | output |
* | --- |
* | "Forgot Password – MetaCleaner" |
*
* @param {Auth_Forgotpassword_Meta_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_meta_title1 = /** @type {((inputs?: Auth_Forgotpassword_Meta_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Meta_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_meta_title1(inputs)
	return __cs.auth_forgotpassword_meta_title1(inputs)
});
export { auth_forgotpassword_meta_title1 as "auth.forgotPassword.meta.title" }
/**
* | output |
* | --- |
* | "Recover" |
*
* @param {Auth_Forgotpassword_Branding_Headline1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_branding_headline1 = /** @type {((inputs?: Auth_Forgotpassword_Branding_Headline1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Branding_Headline1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_branding_headline1(inputs)
	return __cs.auth_forgotpassword_branding_headline1(inputs)
});
export { auth_forgotpassword_branding_headline1 as "auth.forgotPassword.branding.headline" }
/**
* | output |
* | --- |
* | "access" |
*
* @param {Auth_Forgotpassword_Branding_Headlinehighlight2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_branding_headlinehighlight2 = /** @type {((inputs?: Auth_Forgotpassword_Branding_Headlinehighlight2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Branding_Headlinehighlight2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_branding_headlinehighlight2(inputs)
	return __cs.auth_forgotpassword_branding_headlinehighlight2(inputs)
});
export { auth_forgotpassword_branding_headlinehighlight2 as "auth.forgotPassword.branding.headlineHighlight" }
/**
* | output |
* | --- |
* | "to your account" |
*
* @param {Auth_Forgotpassword_Branding_Headlineafter2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_branding_headlineafter2 = /** @type {((inputs?: Auth_Forgotpassword_Branding_Headlineafter2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Branding_Headlineafter2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_branding_headlineafter2(inputs)
	return __cs.auth_forgotpassword_branding_headlineafter2(inputs)
});
export { auth_forgotpassword_branding_headlineafter2 as "auth.forgotPassword.branding.headlineAfter" }
/**
* | output |
* | --- |
* | "Account access recovery" |
*
* @param {Auth_Forgotpassword_Branding_Subtitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_branding_subtitle1 = /** @type {((inputs?: Auth_Forgotpassword_Branding_Subtitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Branding_Subtitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_branding_subtitle1(inputs)
	return __cs.auth_forgotpassword_branding_subtitle1(inputs)
});
export { auth_forgotpassword_branding_subtitle1 as "auth.forgotPassword.branding.subtitle" }
/**
* | output |
* | --- |
* | "Forgot your password? No worries. We'll send you a secure code to your email and you'll be back in no time." |
*
* @param {Auth_Forgotpassword_Branding_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_branding_description1 = /** @type {((inputs?: Auth_Forgotpassword_Branding_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Branding_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_branding_description1(inputs)
	return __cs.auth_forgotpassword_branding_description1(inputs)
});
export { auth_forgotpassword_branding_description1 as "auth.forgotPassword.branding.description" }
/**
* | output |
* | --- |
* | "Enter email" |
*
* @param {Auth_Forgotpassword_Step1_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_step1_title1 = /** @type {((inputs?: Auth_Forgotpassword_Step1_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Step1_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_step1_title1(inputs)
	return __cs.auth_forgotpassword_step1_title1(inputs)
});
export { auth_forgotpassword_step1_title1 as "auth.forgotPassword.step1.title" }
/**
* | output |
* | --- |
* | "We'll send a verification code to your account." |
*
* @param {Auth_Forgotpassword_Step1_Desc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_step1_desc1 = /** @type {((inputs?: Auth_Forgotpassword_Step1_Desc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Step1_Desc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_step1_desc1(inputs)
	return __cs.auth_forgotpassword_step1_desc1(inputs)
});
export { auth_forgotpassword_step1_desc1 as "auth.forgotPassword.step1.desc" }
/**
* | output |
* | --- |
* | "Verify code" |
*
* @param {Auth_Forgotpassword_Step2_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_step2_title1 = /** @type {((inputs?: Auth_Forgotpassword_Step2_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Step2_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_step2_title1(inputs)
	return __cs.auth_forgotpassword_step2_title1(inputs)
});
export { auth_forgotpassword_step2_title1 as "auth.forgotPassword.step2.title" }
/**
* | output |
* | --- |
* | "Enter the 6-digit code from email." |
*
* @param {Auth_Forgotpassword_Step2_Desc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_step2_desc1 = /** @type {((inputs?: Auth_Forgotpassword_Step2_Desc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Step2_Desc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_step2_desc1(inputs)
	return __cs.auth_forgotpassword_step2_desc1(inputs)
});
export { auth_forgotpassword_step2_desc1 as "auth.forgotPassword.step2.desc" }
/**
* | output |
* | --- |
* | "Set new password" |
*
* @param {Auth_Forgotpassword_Step3_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_step3_title1 = /** @type {((inputs?: Auth_Forgotpassword_Step3_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Step3_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_step3_title1(inputs)
	return __cs.auth_forgotpassword_step3_title1(inputs)
});
export { auth_forgotpassword_step3_title1 as "auth.forgotPassword.step3.title" }
/**
* | output |
* | --- |
* | "Choose a strong password and sign in." |
*
* @param {Auth_Forgotpassword_Step3_Desc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_step3_desc1 = /** @type {((inputs?: Auth_Forgotpassword_Step3_Desc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Step3_Desc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_step3_desc1(inputs)
	return __cs.auth_forgotpassword_step3_desc1(inputs)
});
export { auth_forgotpassword_step3_desc1 as "auth.forgotPassword.step3.desc" }
/**
* | output |
* | --- |
* | "Secure process" |
*
* @param {Auth_Forgotpassword_Security_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_security_title1 = /** @type {((inputs?: Auth_Forgotpassword_Security_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Security_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_security_title1(inputs)
	return __cs.auth_forgotpassword_security_title1(inputs)
});
export { auth_forgotpassword_security_title1 as "auth.forgotPassword.security.title" }
/**
* | output |
* | --- |
* | "Link expires in 15 minutes. Your data is protected by end-to-end encryption." |
*
* @param {Auth_Forgotpassword_Security_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_security_description1 = /** @type {((inputs?: Auth_Forgotpassword_Security_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Security_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_security_description1(inputs)
	return __cs.auth_forgotpassword_security_description1(inputs)
});
export { auth_forgotpassword_security_description1 as "auth.forgotPassword.security.description" }
/**
* | output |
* | --- |
* | "Forgot password" |
*
* @param {Auth_Forgotpassword_Form_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_form_title1 = /** @type {((inputs?: Auth_Forgotpassword_Form_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Form_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_form_title1(inputs)
	return __cs.auth_forgotpassword_form_title1(inputs)
});
export { auth_forgotpassword_form_title1 as "auth.forgotPassword.form.title" }
/**
* | output |
* | --- |
* | "Account access recovery" |
*
* @param {Auth_Forgotpassword_Form_Subtitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_form_subtitle1 = /** @type {((inputs?: Auth_Forgotpassword_Form_Subtitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Form_Subtitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_form_subtitle1(inputs)
	return __cs.auth_forgotpassword_form_subtitle1(inputs)
});
export { auth_forgotpassword_form_subtitle1 as "auth.forgotPassword.form.subtitle" }
/**
* | output |
* | --- |
* | "Enter your email and we'll send you a code to reset your password." |
*
* @param {Auth_Forgotpassword_Form_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_form_description1 = /** @type {((inputs?: Auth_Forgotpassword_Form_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Form_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_form_description1(inputs)
	return __cs.auth_forgotpassword_form_description1(inputs)
});
export { auth_forgotpassword_form_description1 as "auth.forgotPassword.form.description" }
/**
* | output |
* | --- |
* | "Send code" |
*
* @param {Auth_Forgotpassword_Submit_Sendcode2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_submit_sendcode2 = /** @type {((inputs?: Auth_Forgotpassword_Submit_Sendcode2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Submit_Sendcode2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_submit_sendcode2(inputs)
	return __cs.auth_forgotpassword_submit_sendcode2(inputs)
});
export { auth_forgotpassword_submit_sendcode2 as "auth.forgotPassword.submit.sendCode" }
/**
* | output |
* | --- |
* | "We'll send a verification code" |
*
* @param {Auth_Forgotpassword_Mobile_Step1desc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_mobile_step1desc2 = /** @type {((inputs?: Auth_Forgotpassword_Mobile_Step1desc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Mobile_Step1desc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_mobile_step1desc2(inputs)
	return __cs.auth_forgotpassword_mobile_step1desc2(inputs)
});
export { auth_forgotpassword_mobile_step1desc2 as "auth.forgotPassword.mobile.step1Desc" }
/**
* | output |
* | --- |
* | "6-digit code from email" |
*
* @param {Auth_Forgotpassword_Mobile_Step2desc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_mobile_step2desc2 = /** @type {((inputs?: Auth_Forgotpassword_Mobile_Step2desc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Mobile_Step2desc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_mobile_step2desc2(inputs)
	return __cs.auth_forgotpassword_mobile_step2desc2(inputs)
});
export { auth_forgotpassword_mobile_step2desc2 as "auth.forgotPassword.mobile.step2Desc" }
/**
* | output |
* | --- |
* | "New password" |
*
* @param {Auth_Forgotpassword_Mobile_Step3title2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_mobile_step3title2 = /** @type {((inputs?: Auth_Forgotpassword_Mobile_Step3title2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Mobile_Step3title2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_mobile_step3title2(inputs)
	return __cs.auth_forgotpassword_mobile_step3title2(inputs)
});
export { auth_forgotpassword_mobile_step3title2 as "auth.forgotPassword.mobile.step3Title" }
/**
* | output |
* | --- |
* | "Choose a strong password" |
*
* @param {Auth_Forgotpassword_Mobile_Step3desc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_mobile_step3desc2 = /** @type {((inputs?: Auth_Forgotpassword_Mobile_Step3desc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Mobile_Step3desc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_mobile_step3desc2(inputs)
	return __cs.auth_forgotpassword_mobile_step3desc2(inputs)
});
export { auth_forgotpassword_mobile_step3desc2 as "auth.forgotPassword.mobile.step3Desc" }
/**
* | output |
* | --- |
* | "Verify code" |
*
* @param {Auth_Forgotpassword_Otp_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_otp_title1 = /** @type {((inputs?: Auth_Forgotpassword_Otp_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Otp_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_otp_title1(inputs)
	return __cs.auth_forgotpassword_otp_title1(inputs)
});
export { auth_forgotpassword_otp_title1 as "auth.forgotPassword.otp.title" }
/**
* | output |
* | --- |
* | "Step 2 of 3" |
*
* @param {Auth_Forgotpassword_Otp_Steplabel2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_otp_steplabel2 = /** @type {((inputs?: Auth_Forgotpassword_Otp_Steplabel2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Otp_Steplabel2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_otp_steplabel2(inputs)
	return __cs.auth_forgotpassword_otp_steplabel2(inputs)
});
export { auth_forgotpassword_otp_steplabel2 as "auth.forgotPassword.otp.stepLabel" }
/**
* | output |
* | --- |
* | "Enter the 6-digit code sent to" |
*
* @param {Auth_Forgotpassword_Otp_Sentto2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_otp_sentto2 = /** @type {((inputs?: Auth_Forgotpassword_Otp_Sentto2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Otp_Sentto2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_otp_sentto2(inputs)
	return __cs.auth_forgotpassword_otp_sentto2(inputs)
});
export { auth_forgotpassword_otp_sentto2 as "auth.forgotPassword.otp.sentTo" }
/**
* | output |
* | --- |
* | "Expires in" |
*
* @param {Auth_Forgotpassword_Otp_Expiresin2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_otp_expiresin2 = /** @type {((inputs?: Auth_Forgotpassword_Otp_Expiresin2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Otp_Expiresin2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_otp_expiresin2(inputs)
	return __cs.auth_forgotpassword_otp_expiresin2(inputs)
});
export { auth_forgotpassword_otp_expiresin2 as "auth.forgotPassword.otp.expiresIn" }
/**
* | output |
* | --- |
* | "Verify code" |
*
* @param {Auth_Forgotpassword_Otp_Verify1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_otp_verify1 = /** @type {((inputs?: Auth_Forgotpassword_Otp_Verify1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Otp_Verify1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_otp_verify1(inputs)
	return __cs.auth_forgotpassword_otp_verify1(inputs)
});
export { auth_forgotpassword_otp_verify1 as "auth.forgotPassword.otp.verify" }
/**
* | output |
* | --- |
* | "New password" |
*
* @param {Auth_Forgotpassword_Newpassword_Title2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_newpassword_title2 = /** @type {((inputs?: Auth_Forgotpassword_Newpassword_Title2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Newpassword_Title2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_newpassword_title2(inputs)
	return __cs.auth_forgotpassword_newpassword_title2(inputs)
});
export { auth_forgotpassword_newpassword_title2 as "auth.forgotPassword.newPassword.title" }
/**
* | output |
* | --- |
* | "Step 3 of 3" |
*
* @param {Auth_Forgotpassword_Newpassword_Steplabel3Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_newpassword_steplabel3 = /** @type {((inputs?: Auth_Forgotpassword_Newpassword_Steplabel3Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Newpassword_Steplabel3Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_newpassword_steplabel3(inputs)
	return __cs.auth_forgotpassword_newpassword_steplabel3(inputs)
});
export { auth_forgotpassword_newpassword_steplabel3 as "auth.forgotPassword.newPassword.stepLabel" }
/**
* | output |
* | --- |
* | "Choose a strong password for your account." |
*
* @param {Auth_Forgotpassword_Newpassword_Description2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_newpassword_description2 = /** @type {((inputs?: Auth_Forgotpassword_Newpassword_Description2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Newpassword_Description2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_newpassword_description2(inputs)
	return __cs.auth_forgotpassword_newpassword_description2(inputs)
});
export { auth_forgotpassword_newpassword_description2 as "auth.forgotPassword.newPassword.description" }
/**
* | output |
* | --- |
* | "Done!" |
*
* @param {Auth_Forgotpassword_Success_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_success_title1 = /** @type {((inputs?: Auth_Forgotpassword_Success_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Success_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_success_title1(inputs)
	return __cs.auth_forgotpassword_success_title1(inputs)
});
export { auth_forgotpassword_success_title1 as "auth.forgotPassword.success.title" }
/**
* | output |
* | --- |
* | "Your password has been successfully changed. You can now sign in." |
*
* @param {Auth_Forgotpassword_Success_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_success_description1 = /** @type {((inputs?: Auth_Forgotpassword_Success_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Success_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_forgotpassword_success_description1(inputs)
	return __cs.auth_forgotpassword_success_description1(inputs)
});
export { auth_forgotpassword_success_description1 as "auth.forgotPassword.success.description" }
/**
* | output |
* | --- |
* | "Verify Code – MetaCleaner" |
*
* @param {Auth_Checkcode_Meta_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_meta_title1 = /** @type {((inputs?: Auth_Checkcode_Meta_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Meta_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkcode_meta_title1(inputs)
	return __cs.auth_checkcode_meta_title1(inputs)
});
export { auth_checkcode_meta_title1 as "auth.checkCode.meta.title" }
/**
* | output |
* | --- |
* | "Code sent to" |
*
* @param {Auth_Checkcode_Hint_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_hint_title1 = /** @type {((inputs?: Auth_Checkcode_Hint_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Hint_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkcode_hint_title1(inputs)
	return __cs.auth_checkcode_hint_title1(inputs)
});
export { auth_checkcode_hint_title1 as "auth.checkCode.hint.title" }
/**
* | output |
* | --- |
* | "Code sent to {email}. Please also check your spam folder." |
*
* @param {Auth_Checkcode_Hint_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_hint_description1 = /** @type {((inputs: Auth_Checkcode_Hint_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Hint_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkcode_hint_description1(inputs)
	return __cs.auth_checkcode_hint_description1(inputs)
});
export { auth_checkcode_hint_description1 as "auth.checkCode.hint.description" }
/**
* | output |
* | --- |
* | "Enter the 6-digit code we sent to" |
*
* @param {Auth_Checkcode_Otp_Sentto2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_otp_sentto2 = /** @type {((inputs?: Auth_Checkcode_Otp_Sentto2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Otp_Sentto2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkcode_otp_sentto2(inputs)
	return __cs.auth_checkcode_otp_sentto2(inputs)
});
export { auth_checkcode_otp_sentto2 as "auth.checkCode.otp.sentTo" }
/**
* | output |
* | --- |
* | "Code expires in" |
*
* @param {Auth_Checkcode_Countdown_Label1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_countdown_label1 = /** @type {((inputs?: Auth_Checkcode_Countdown_Label1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Countdown_Label1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkcode_countdown_label1(inputs)
	return __cs.auth_checkcode_countdown_label1(inputs)
});
export { auth_checkcode_countdown_label1 as "auth.checkCode.countdown.label" }
/**
* | output |
* | --- |
* | "We sent the code to your email. If you don't see it, check the Spam or Bulk folder." |
*
* @param {Auth_Checkcode_Help_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkcode_help_description1 = /** @type {((inputs?: Auth_Checkcode_Help_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkcode_Help_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_checkcode_help_description1(inputs)
	return __cs.auth_checkcode_help_description1(inputs)
});
export { auth_checkcode_help_description1 as "auth.checkCode.help.description" }
/**
* | output |
* | --- |
* | "New Password – MetaCleaner" |
*
* @param {Auth_Newpassword_Meta_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_meta_title1 = /** @type {((inputs?: Auth_Newpassword_Meta_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Meta_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_meta_title1(inputs)
	return __cs.auth_newpassword_meta_title1(inputs)
});
export { auth_newpassword_meta_title1 as "auth.newPassword.meta.title" }
/**
* | output |
* | --- |
* | "Set new password" |
*
* @param {Auth_Newpassword_Branding_Headline1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_branding_headline1 = /** @type {((inputs?: Auth_Newpassword_Branding_Headline1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Branding_Headline1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_branding_headline1(inputs)
	return __cs.auth_newpassword_branding_headline1(inputs)
});
export { auth_newpassword_branding_headline1 as "auth.newPassword.branding.headline" }
/**
* | output |
* | --- |
* | "You're almost done. Choose a strong password to protect your account. We recommend a combination of letters, numbers and symbols." |
*
* @param {Auth_Newpassword_Branding_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_branding_description1 = /** @type {((inputs?: Auth_Newpassword_Branding_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Branding_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_branding_description1(inputs)
	return __cs.auth_newpassword_branding_description1(inputs)
});
export { auth_newpassword_branding_description1 as "auth.newPassword.branding.description" }
/**
* | output |
* | --- |
* | "We sent a verification code to your account." |
*
* @param {Auth_Newpassword_Step1_Donedesc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_step1_donedesc2 = /** @type {((inputs?: Auth_Newpassword_Step1_Donedesc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Step1_Donedesc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_step1_donedesc2(inputs)
	return __cs.auth_newpassword_step1_donedesc2(inputs)
});
export { auth_newpassword_step1_donedesc2 as "auth.newPassword.step1.doneDesc" }
/**
* | output |
* | --- |
* | "6-digit code successfully verified." |
*
* @param {Auth_Newpassword_Step2_Donedesc2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_step2_donedesc2 = /** @type {((inputs?: Auth_Newpassword_Step2_Donedesc2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Step2_Donedesc2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_step2_donedesc2(inputs)
	return __cs.auth_newpassword_step2_donedesc2(inputs)
});
export { auth_newpassword_step2_donedesc2 as "auth.newPassword.step2.doneDesc" }
/**
* | output |
* | --- |
* | "Tip for a secure password" |
*
* @param {Auth_Newpassword_Tip_Title1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_tip_title1 = /** @type {((inputs?: Auth_Newpassword_Tip_Title1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Tip_Title1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_tip_title1(inputs)
	return __cs.auth_newpassword_tip_title1(inputs)
});
export { auth_newpassword_tip_title1 as "auth.newPassword.tip.title" }
/**
* | output |
* | --- |
* | "Use at least 12 characters, uppercase and lowercase letters, numbers and special characters like !@#$%" |
*
* @param {Auth_Newpassword_Tip_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_tip_description1 = /** @type {((inputs?: Auth_Newpassword_Tip_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Tip_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_tip_description1(inputs)
	return __cs.auth_newpassword_tip_description1(inputs)
});
export { auth_newpassword_tip_description1 as "auth.newPassword.tip.description" }
/**
* | output |
* | --- |
* | "Set new password" |
*
* @param {Auth_Newpassword_Mobile_Headline1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_mobile_headline1 = /** @type {((inputs?: Auth_Newpassword_Mobile_Headline1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Mobile_Headline1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_mobile_headline1(inputs)
	return __cs.auth_newpassword_mobile_headline1(inputs)
});
export { auth_newpassword_mobile_headline1 as "auth.newPassword.mobile.headline" }
/**
* | output |
* | --- |
* | "Step 3 of 3 · Choose a strong password" |
*
* @param {Auth_Newpassword_Mobile_Subtitle1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_mobile_subtitle1 = /** @type {((inputs?: Auth_Newpassword_Mobile_Subtitle1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Mobile_Subtitle1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_mobile_subtitle1(inputs)
	return __cs.auth_newpassword_mobile_subtitle1(inputs)
});
export { auth_newpassword_mobile_subtitle1 as "auth.newPassword.mobile.subtitle" }
/**
* | output |
* | --- |
* | "Choose a strong password to protect your MetaCleaner account." |
*
* @param {Auth_Newpassword_Form_Description1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_form_description1 = /** @type {((inputs?: Auth_Newpassword_Form_Description1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Form_Description1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_form_description1(inputs)
	return __cs.auth_newpassword_form_description1(inputs)
});
export { auth_newpassword_form_description1 as "auth.newPassword.form.description" }
/**
* | output |
* | --- |
* | "Use 12+ characters, uppercase and lowercase letters, numbers and !@#$% characters" |
*
* @param {Auth_Newpassword_Mobile_Tip1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_newpassword_mobile_tip1 = /** @type {((inputs?: Auth_Newpassword_Mobile_Tip1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Newpassword_Mobile_Tip1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return __en.auth_newpassword_mobile_tip1(inputs)
	return __cs.auth_newpassword_mobile_tip1(inputs)
});
export { auth_newpassword_mobile_tip1 as "auth.newPassword.mobile.tip" }