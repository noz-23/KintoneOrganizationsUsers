/*
 *所属組織のユーザー展開
 * Copyright (c) 2024 noz-23
 *  https://github.com/noz-23/
 *
 * Licensed under the MIT License
 */

( (PLUGIN_ID_)=>{
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
    // 入力できない様に変更

    console.log('editUsers:%o',editUsers);
   
    events_.record[writeUser].disabled =true;
    return events_;
  });

  // 組織選択 フィールドの更新イベント
  kintone.events.on(EVENTS_CHANGE_ORGANS, async(events_) => {
    console.log('events_:%o',events_);

    let listSetUser=[...events_.record[writeUsers].value];
    // 組織情報の取得
    for( let i ;i<events_.record[readOrgans].value.length;i++){
      let organ = events_.record[readOrgans].value[i];
      // 組織に所属する人の取得
      var paramOrgan={code:organ.code};
      console.log('paramOrgan:%o',paramOrgan);
      
      if( i==events_.record[readOrgans].value.length -1){
        // 最後だけは await にしないで更新
        kintone.api(kintone.api.url('/v1/organization/users.json', true), 'GET',paramOrgan,async (listGetUser_)=>{
          console.log('listGetUser:%o',listGetUser);

          var record =await kintone.app.record.get();
          console.log('record:%o',record);
              // リストに追加
          for(let user of listGetUser){
            listSetUser.push({code:user.code,name:user.name});
          }

          // 重複チェックは更新時にされる          
          record.record[writeUsers].value =listSetUser;
      
          //データの更新
          kintone.app.record.set(record);
        });
      }
      else{
        // 組織ユーザの取得
        var listGetUser =await kintone.api(kintone.api.url('/v1/organization/users.json', true), 'GET',paramOrgan);
        console.log('listGetUser:%o',listGetUser);

        // リストに追加
        for(let user of listGetUser){
          listSetUser.push({code:user.code,name:user.name});
        }
      }
    }
    return events_;
  });

  // グループ選択 フィールドの更新イベント
  kintone.events.on(EVENTS_CHANGE_ORGANS, async(events_) => {
    console.log('events_:%o',events_);

    let listSetUser=[...events_.record[writeUsers].value];
    // グループ情報の取得
    for( let i ;i<events_.record[readGroups].value.length;i++){
      let group = events_.record[readGroups].value[i];
      // グループに所属する人の取得
      var paramGroup={code:group.code};
      console.log('paramGroup:%o',paramGroup);
      
      if( i==events_.record[readGroups].value.length -1){
        // 最後だけは await にしないで更新
        kintone.api(kintone.api.url('/v1/group/users.json', true), 'GET',paramGroup,async (listGetUser_)=>{
          console.log('listGetUser:%o',listGetUser);

          var record =await kintone.app.record.get();
          console.log('record:%o',record);
              // リストに追加
          for(let user of listGetUser){
            listSetUser.push({code:user.code,name:user.name});
          }

          // 重複チェックは更新時にされる          
          record.record[writeUsers].value =listSetUser;
      
          //データの更新
          kintone.app.record.set(record);
        });
      }
      else{
        // グループ ユーザの取得
        var listGetUser =await kintone.api(kintone.api.url('/v1/group/users.json', true), 'GET',paramGroup);
        console.log('listGetUser:%o',listGetUser);

        // リストに追加
        for(let user of listGetUser){
          listSetUser.push({code:user.code,name:user.name});
        }
      }
    }
    return events_;
  });

})(kintone.$PLUGIN_ID);
