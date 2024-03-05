/*
 *所属組織のユーザー展開
 * Copyright (c) 2024 noz-23
 *  https://github.com/noz-23/
 *
 * Licensed under the MIT License
 * History
 *  2024/03/01 0.1.0 初版とりあえずバージョン
 *  2024/03/05 0.2.0 アルゴリズムの見直し
 *  2024/03/05 0.2.1 ユーザー側を編集なしにした場合クリアする方法がなかったため、組織(グループ)なしにした場合はクリアする様に変更
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
        plugin_label       : 'Please Setting Users select',
        users_label        : 'Deployment Users Field     ',
        edit_label         : 'Users Select Field Edit',
        edit_users         : 'Allow',
        organizations_label: 'Organizations Select Field ',
        groups_label       : 'Groups Select Field        ',
        plugin_cancel      : 'Cancel',
        plugin_ok          : ' Save ',
      },
      ja:{
        plugin_titile      : '組織のユーザー展開 プラグイン',
        plugin_description : '組織(グループ)に所属するユーザーを設定します',
        plugin_label       : 'ユーザー選択は設定して下さい',
        users_label        : 'ユーザー フィールド　　'　,
        edit_label         : 'ユーザー フィールドの編集',
        edit_users         : '許可',
        organizations_label: '組織選択 フィールド　　　',
        groups_label       : 'グループ選択 フィールド　',
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
      Label              : '#plugin_label',
      UsersLabel         : '#users_label',
      CountLabel         : '#edit_label',
      OrganizationsLabel : '#organizations_label',
      GroupsLabel        : '#groups_label',
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
    var listFeild =await kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app': kintone.app.getId()});
    console.log("listFeild:%o",listFeild);

    for (const key in listFeild.properties){
      //console.log("properties key:%o",key);
      try {
        const prop = listFeild.properties[key];
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
