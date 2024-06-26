/*
 *所属組織のユーザー展開
 * Copyright (c) 2024 noz-23
 *  https://github.com/noz-23/
 *
 * Licensed under the MIT License
 * 
 *  利用：
 *   JQuery:
 *     https://jquery.com/
 *     https://js.cybozu.com/jquery/3.7.1/jquery.min.js
 *   
 *   jsrender:
 *     https://www.jsviews.com/
 *     https://js.cybozu.com/jsrender/1.0.13/jsrender.min.js
 * 
 * History
 *  2024/03/01 0.1.0 初版とりあえずバージョン
 *  2024/03/05 0.2.0 アルゴリズムの見直し
 *  2024/03/05 0.2.1 ユーザー側を編集なしにした場合クリアする方法がなかったため、組織(グループ)なしにした場合はクリアする様に変更
 *  2024/03/24 0.3.0 プラグイン設定画面に Google AdSense 追加
 *  2024/06/25 0.3.1 設定画面の説明変更(変数の変更等整理)
 */

jQuery.noConflict();

(async (jQuery_,PLUGIN_ID_)=>{
  'use strict';

  // 設定パラメータ
  const ParameterFieldUsers='paramFieldUsers';                 // ユーザーフィールド
  const ParameterEditUsers='paramEditUsers';                   // ユーザーフィールドの編集
  const ParameterFieldOrganizations='paramFieldOrganizations'; // 組織選択フィールド
  const ParameterFieldGroups='paramFieldGroups';               // グループ選択フィールド

  // 環境設定
  const Parameter = {
  // 表示文字
    Lang:{
      en:{
        plugin_titile      : 'Deployment of Organization\'s Users Plugin',
        plugin_description : 'Set all affiliations and preferred organizations to which the user belongs',
        label_plugin       : 'Please Setting Users Field',
        label_users        : 'Deployment Users Field     ',
        label_edit         : 'Allow Edit',
        label_organizations: 'Organizations Select Field ',
        label_groups       : 'Groups Select Field        ',
        label_from         : 'Deployment Source',
        label_to           : 'Deployment Users',
        edit_users         : 'Allow',
        plugin_cancel      : 'Cancel',
        plugin_ok          : ' Save ',
      },
      ja:{
        plugin_titile      : '組織のユーザー展開 プラグイン',
        plugin_description : '組織(グループ)に所属するユーザーを設定します',
        label_plugin       : 'ユーザー フィールドは設定して下さい',
        label_users        : 'ユーザー フィールド　　'　,
        label_edit         : '編集許可',
        label_organizations: '組織選択 フィールド　　　',
        label_groups       : 'グループ選択 フィールド　',
        label_from         : '展開元',
        label_to           : '展開先',
        edit_users         : '許可',
        plugin_cancel      : 'キャンセル',
        plugin_ok          : '   保存  ',
      },
      DefaultSetting:'ja',
      UseLang:{}
    },
    Html:{
      Form               : '#plugin_setting_form',
      Title              : '#plugin_titile',
      Description        : '#plugin_description',
      Cancel             : '#plugin_cancel',
      Ok                 : '#plugin_ok',
    },
    Elements:{
      UsersField         :'#users_field',
      EditUsers          :'#edit_users',
      OrganizationsField :'#organizations_field',
      GroupsField        :'#groups_field',
    },
  };

 
  /*
  HTMLタグの削除
   引数　：htmlstr タグ(<>)を含んだ文字列
   戻り値：タグを含まない文字列
  */
  const escapeHtml =(htmlstr)=>{
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/'/g, '&#39;');
  };  

  /*
  ユーザーの言語設定の読み込み
   引数　：なし
   戻り値：なし
  */
  const settingLang=()=>{
    // 言語設定の取得
    Parameter.Lang.UseLang = kintone.getLoginUser().language;
    switch( Parameter.Lang.UseLang)
    {
      case 'en':
      case 'ja':
        break;
      default:
        Parameter.Lang.UseLang =Parameter.Lang.DefaultSetting;
        break;
    }
    // 言語表示の変更
    var html = jQuery(Parameter.Html.Form).html();
    var tmpl = jQuery.templates(html);
    
    var useLanguage =Parameter.Lang[Parameter.Lang.UseLang];
    // 置き換え
    jQuery(Parameter.Html.Form).html(tmpl.render({lang:useLanguage})).show();
  };

  /*
  フィールド設定
   引数　：なし
   戻り値：なし
  */
  const settingHtml= async ()=>{
    var listField =await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app': kintone.app.getId()});
    console.log("listField:%o",listField);

    for (const key in listField.properties){
      //console.log("properties key:%o",key);
      try {
        const prop = listField.properties[key];
        //console.log("prop:%o",prop);
    
        // ユーザー選択フィールドのみ入れる
        if (prop.type === 'USER_SELECT'){
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));
          console.log("Add USER_SELECT option:%o",option);
          jQuery(Parameter.Elements.UsersField).append(option);
        }
        // 組織選択フィールドのみ入れる
        if (prop.type === 'ORGANIZATION_SELECT'){
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));

          console.log("Add ORGANIZATION_SELECT option:%o",option);
          jQuery(Parameter.Elements.OrganizationsField).append(option);
        }
        // グループ選択フィールドのみ入れる
        if (prop.type === 'GROUP_SELECT'){
          const option = jQuery('<option/>');
          option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label));

          console.log("Add GROUP_SELECT option:%o",option);          
          jQuery(Parameter.Elements.GroupsField).append(option);
        }
                 
      }
      catch (error) {
        console.log("error:%o",error);
      }

      // 現在データの呼び出し
      var nowConfig =kintone.plugin.app.getConfig(PLUGIN_ID_);
      console.log("nowConfig:%o",nowConfig);

      // 現在データの表示
      if(nowConfig[ParameterFieldUsers]){
        jQuery(Parameter.Elements.UsersField).val(nowConfig[ParameterFieldUsers]); 
      }
      if(nowConfig[ParameterEditUsers]){
        jQuery(Parameter.Elements.EditUsers).prop('checked', nowConfig[ParameterEditUsers] =='true'); 
      }
      if(nowConfig[ParameterFieldOrganizations]){
        jQuery(Parameter.Elements.OrganizationsField).val(nowConfig[ParameterFieldOrganizations]); 
      }
      if(nowConfig[ParameterFieldGroups]){
        jQuery(Parameter.Elements.GroupsField).val(nowConfig[ParameterFieldGroups]); 
      }
    }
  };

  /*
  データの保存
   引数　：なし
   戻り値：なし
  */
   const saveSetting=()=>{
    // 各パラメータの保存
    var config ={};
    config[ParameterFieldUsers]=jQuery(Parameter.Elements.UsersField).val();
    config[ParameterEditUsers]=''+jQuery(Parameter.Elements.EditUsers).prop('checked');
    config[ParameterFieldOrganizations]=jQuery(Parameter.Elements.OrganizationsField).val();
    config[ParameterFieldGroups]=jQuery(Parameter.Elements.GroupsField).val();

    console.log('config:%o',config);

    // 設定の保存
    kintone.plugin.app.setConfig(config);
  };

  // 言語設定
  settingLang();
  await settingHtml();

  // 保存
  jQuery(Parameter.Html.Ok).click(() =>{saveSetting();});
  // キャンセル
  jQuery(Parameter.Html.Cancel).click(()=>{history.back();});

})(jQuery, kintone.$PLUGIN_ID);
