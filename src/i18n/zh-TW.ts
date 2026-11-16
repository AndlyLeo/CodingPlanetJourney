// 繁體中文介面文字（第一版）。
// 畫面程式不直接寫死文字，一律從這裡讀取；日後新增語系時，複製此檔並翻譯即可。
// 標題 CodingPlanetJourney 為品牌名稱，維持英文，不放在語系檔。
export const zhTW = {
  // 語音說明（TTS）使用的語言代碼。新增其他語系時，改成對應的代碼，例如 'en-US'。
  speechLanguage: 'zh-TW',
  welcome: {
    start: '開始冒險',
    settings: '設定',
    logoLabel: 'CodingPlanetJourney',
  },
  worlds: {
    title: '冒險地圖',
    locked: '尚未解鎖',
    itemPrefix: '主題區域',
    // 25 個主題區域名稱（區域圖片裡的名稱目前是畫在圖上的，這裡的名稱供無障礙朗讀與暫時畫面使用），順序即解鎖順序。正式名稱確定後直接修改這裡。
    regionNames: [
      '新手村', '動物歡樂島', '海底珊瑚王國', '美食料理街', '奇妙超市城',
      '第 6 區', '第 7 區', '第 8 區', '第 9 區', '第 10 區',
      '第 11 區', '第 12 區', '第 13 區', '第 14 區', '第 15 區',
      '第 16 區', '第 17 區', '第 18 區', '第 19 區', '第 20 區',
      '第 21 區', '第 22 區', '第 23 區', '第 24 區', '第 25 區',
    ],
    levelTitle: (n: number) => `第 ${n} 關`,
    starsLabel: '星星',
  },
  settings: {
    title: '設定',
    chooseLook: '選擇外觀',
    // 以下幾項與狀態文字是測試用，正式版會移除
    completeLevel: '完成一關',
    levelStatus: (done: number, total: number) => `第 1 區：已完成 ${done} / ${total} 關`,
    unlockNext: '解鎖下一區',
    resetUnlock: '重設解鎖',
    voiceOn: '語音說明：開',
    voiceOff: '語音說明：關',
    resetHowTo: '重看玩法',
    unlockStatus: (count: number, total: number) => `測試用：已解鎖 ${count} / ${total} 區`,
  },
  characters: {
    title: '選擇外觀',
    titleVertical: true, // 中文標題直排（一字一行）；其他語言設為 false，改為橫向書寫並自動換行
    selected: '已選擇！',
    locked: '尚未解鎖',
    itemPrefix: '角色',
  },
  game: {
    run: '執行',
    reset: '重來',
    hint: '提示',
    howToTitle: '玩法',
    howTo: ['方塊可以從下面的準備區拉動到上方程式區的空格。', '放錯的方塊，點一下就可以刪除。'],
    showHint: '看這一關的提示',
    hintWarning: '看了提示，這一關最多只能拿 2 顆星喔！',
    gotIt: '知道了',
    listen: '聽',
    winSpoken: (stars: number) => `過關了！你得到 ${stars} 顆星`,
    levelLabel: (n: number) => `第 ${n} 關`,
    repeatLabel: (times: number) => `重複 ${times} 次`,
    commands: { forward: '前進', left: '左轉', right: '右轉' },
    win: '過關了！',
    next: '下一關',
    again: '再玩一次',
    toMap: '回到地圖',
    fail: {
      bump: '撞到了！再試一次',
      short: '還沒走到旗子喔',
      gems: '還有寶石沒收集喔',
      empty: '先把方塊放進格子裡',
    },
  },
  // 各關的標題、說明與提示。key 是區域編號，陣列依關卡順序排列。
  worldLevels: {
    '01': [
      { title: '第一步', story: '用「前進」方塊，帶小夥伴走到旗子那裡！', hint: '把「前進」方塊拖到下面的空格，排成一排。' },
      { title: '走長路', story: '路變長了，需要更多「前進」喔！', hint: '數一數，要走幾格才會到旗子？' },
      { title: '右轉彎', story: '路在前面轉彎了，試試「右轉」！', hint: '先往前走 2 格，再右轉，再往前走 2 格。' },
      { title: '左轉右轉', story: '這條小路有左轉也有右轉，仔細看看路線！', hint: '先往前走到轉角，看看路接下來往哪邊轉。' },
      { title: '收集寶石', story: '路上有閃亮的寶石，全部收集完再走到旗子！', hint: '走過寶石就會收集，別漏掉任何一顆。' },
      { title: '重複走', story: '「重複」方塊可以把動作重複很多次！', hint: '只要把一個「前進」放進重複裡就夠了。' },
      { title: '重複爬樓梯', story: '樓梯要走好多階，把一階的動作重複 3 次！', hint: '每一階是：前進、右轉、前進、左轉。' },
      { title: '找錯誤', story: '這段程式有一個地方錯了，看看小夥伴走到哪裡，把它修好！', hint: '看小夥伴在哪一個轉角走錯了，換一個轉彎方向試試。' },
      { title: '重複與寶石', story: '重複裡可以放兩個動作，一邊走一邊收集寶石！', hint: '重複的動作是「前進、前進」。' },
      { title: '繞池塘', story: '繞著池塘走一圈，把三顆寶石都收集起來！', hint: '每一邊都是：前進、前進、左轉。' },
      { title: '自由組合', story: '自己決定怎麼排，試試看用最少的方塊過關！', hint: '走直線的地方，可以交給「重複」。' },
      { title: '城堡大門', story: '最後的挑戰！爬上階梯，收集寶石，打開城堡大門！', hint: '一階是：前進、前進、左轉、前進、右轉，重複 2 次。' },
    ],
  },
  common: {
    back: '返回',
    comingSoon: '這個畫面還在準備中',
  },
} as const;
