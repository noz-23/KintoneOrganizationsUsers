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
 *
 */

jQuery.noConflict();

(async ( PLUGIN_ID_) => {
  'use strict';
  // Kintone プラグイン 設定パラメータ
  const config = kintone.plugin.app.getConfig(PLUGIN_ID_);

  const writeUsers=config['paramFieldUsers'];           // 書き込むユーザーのフィールド 名
  const editUsers=config['paramEditUsers'];            // ユーザーのフィールドの編集許可
  const readOrgans =config['paramFieldOrganizations']; // 読み取る組織のフィールド名
  const readGroups =config['paramFieldGroups'];        // 読み取るグループのフィールド名

  let EVENTS_EDIT =[
    'app.record.create.show', // 作成表示
    'app.record.edit.show',   // 編集表示
    'app.record.index.show',  // 一覧表示
  ];

  // 組織選択 フィールド更新
  let EVENTS_CHANGE_ORGANS =[
    'app.record.create.change.'+readOrgans,
    'app.record.edit.change.'  +readOrgans,
    'app.record.index.change.' +readOrgans,
  ];

  // グループ選択 フィールド更新
  let EVENTS_CHANGE_GROUPS =[
    'app.record.create.change.'+readGroups,
    'app.record.edit.change.'  +readGroups,
    'app.record.index.change.' +readGroups,
  ];
  kintone.events.on(EVENTS_EDIT, (events_) => {
    console.log('events_:%o',events_);

    console.log('editUsers:%o',editUsers);
   
    // 入力できない様に変更
    if(editUsers !='true')
    {
      events_.record[writeUsers].disabled =true;  
    }
    return events_;
  });

  // 組織選択 フィールドの更新イベント
  kintone.events.on(EVENTS_CHANGE_ORGANS, (events_) => {
    console.log('Organs events_:%o',events_);

    setUsers(events_, readOrgans,'/v1/organization/users.json');
  });
  // グループ選択 フィールドの更新イベント
  kintone.events.on(EVENTS_CHANGE_GROUPS, (events_) => {
    console.log('Group events_:%o',events_);

    setUsers(events_, readGroups,'/v1/group/users.json');
  });

  /* 
  ユーザー選択へのデータ入れ
   引数　：events_ イベントデータ, readFeild_ 読み取りフィールド名, apiFieldUsers_ 実行するAPI
   戻り値：なし
  */
  const setUsers=async ( events_, readFeild_, apiFieldUsers_)=>{
    console.log('setUsers:%o %o',readFeild_, apiFieldUsers_);

    let listSetUser=[...events_.record[writeUsers].value];
    console.log('listSetUser:%o',listSetUser);

    // 組織(グループ)情報の取得
    for( let field of events_.record[readFeild_].value){
      // 組織(グループ)に所属する人の取得
      var paramField={code:field.code};
      console.log('paramField:%o',paramField);

      var listGetUser =await kintone.api(kintone.api.url(apiFieldUsers_, true), 'GET',paramField);
      
      // 組織(グループ)ユーザの取得
      console.log('listGetUser:%o',listGetUser);

      //
      if( listGetUser['userTitles']){
        // 組織
        for(let user of listGetUser.userTitles){
          listSetUser.push({code:user.user.code,name:user.user.name});
        }
      }
      else{
        // グループ
        for(let user of listGetUser.users){
          listSetUser.push({code:user.code,name:user.name});
        }
      }
    }

    await Sleep(500);
    var record =await kintone.app.record.get();

    // ユーザー選択が編集不可で、選択されてない場合はクリア
    if(editUsers !='true')
    {
      if(events_.record[readFeild_].value.length ==0)
      {
        listSetUser =[];
      }
    }

    // 重複チェックは更新時にされる          
    record.record[writeUsers].value =listSetUser;

    console.log('record:%o',record);
    kintone.app.record.set(record);
  };

  /*
  スリープ関数
   引数　：ms_ ms単位のスリープ時間
   戻り値：なし
  */
  const Sleep=(ms_)=>{
    return new Promise(resolve_ => setTimeout(resolve_, ms_));
  };

})(kintone.$PLUGIN_ID);
