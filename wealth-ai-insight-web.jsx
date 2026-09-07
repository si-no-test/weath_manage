import { useState, useMemo, useRef } from "react";

/* ============================================================
   Wealth Management AI Insight — 理專分析工作台
   設計語彙：金融墨綠 × 帳票紙白 × 燙金強調
   ============================================================ */

/* 配色依使用者提供之永豐銀行官網首頁截圖取樣：企業紅 × 米色底 × 暖深灰 */
const C = {
  ink: "#333233",        // 暖深灰（內文，取樣 #333233）
  pine: "#AA2D2E",       // 深紅（按鈕/表頭，取樣「限量登錄」鈕 #AA2D2E）
  pineDeep: "#8E2425",   // 更深紅（報告標題列/漸層深端）
  paper: "#F4F2EA",      // 米色（頁面底色，取樣 #F4F2EA）
  card: "#FFFFFF",
  line: "#E4DECF",
  gold: "#CA3625",       // 永豐 logo 企業紅（大標/強調，取樣 #CA3625）
  goldSoft: "#F8EFE4",   // 淡暖米（市場事件卡底）
  gray: "#727172",       // 中性灰（輔助文字，取樣 icon 灰）
  red: "#C62828",        // 功能警示紅（逾期/反向）
  redSoft: "#FBEBE9",
  green: "#2E7D32",
  gain: "#CE2B2B",   // 台灣習慣:獲利紅字
  loss: "#1F7A33",   // 台灣習慣:損失綠字
  amber: "#A8620A",
  amberSoft: "#FAF0DE",
};

const font = {
  body: `"PingFang TC","Microsoft JhengHei","Noto Sans TC",system-ui,sans-serif`,
  serif: `Georgia,"Noto Serif TC","PMingLiU",serif`,
};

/* ---------------- 案例資料（exampledata_new，唯讀） ---------------- */

const CASES = [
  {
    id: "c1",
    tab: "案例1",
    type: "退休保守型",
    name: "陳秀蘭",
    profile: [
      ["姓名", "陳秀蘭"], ["性別", "女"], ["年齡", "67"], ["學歷", "大學"],
      ["工作", "退休（前公立學校教師）"], ["PI客戶", "否"], ["推薦是否同意", "是"],
      ["風險等級", "RR2"], ["風險屬性評估日期", "2026/07/01"],
      ["永豐財富等級", "永富"], ["往來資產規模(NTD)", "13,600,000"],
    ],
    deposits: [
      ["台幣活存", "—", "2,000,000", ["2,120,000","2,060,000","2,030,000"]],
      ["台幣定存", "定存 NTD 800萬・年利率1.6%・到期日2026/09/15", "8,000,000", ["8,000,000","8,000,000","8,000,000"]],
      ["外幣活存(NTD)", "USD 20,000", "600,000", ["600,000","600,000","600,000"]],
      ["外幣定存", "—", "0"],
    ],
    investments: [
      { buy: "2023/04/10", cur: "新臺幣", name: "安聯收益成長多重資產基金", principal: 2100000, current: 2000000, dividend: 180000, series: [{ d: "5月底", current: 2080000, dividend: 150000 }, { d: "6月底", current: 2070000, dividend: 165000 }, { d: "7月底", current: 2050000, dividend: 172000 }] },
      { buy: "2024/11/20", cur: "美元", name: "PIMCO 多元收益債券基金", principal: 1050000, current: 1000000, dividend: 60000, series: [{ d: "5月底", current: 1040000, dividend: 45000 }, { d: "6月底", current: 1035000, dividend: 50000 }, { d: "7月底", current: 1025000, dividend: 55000 }] },
    ],
    liabilities: [["貸款", "0"]],
    event: "費城半導體指數暴跌4.29%，引發台股加權指數重挫2,953點",
    defaultNeeds: [
      { strategy: "正向", text: "注重穩定收益" },
      { strategy: "正向", text: "喜好部份資金定存" },
    ],
    defaultHistory: ["對本行態度佳"],
  },
  {
    id: "c2",
    tab: "案例2",
    type: "穩健累積型",
    name: "林建宏",
    profile: [
      ["姓名", "林建宏"], ["性別", "男"], ["年齡", "46"], ["學歷", "碩博士"],
      ["工作", "科技公司研發部門主管"], ["PI客戶", "是"], ["推薦是否同意", "是"],
      ["風險等級", "RR3"], ["風險屬性評估日期", "2026/07/01"],
      ["永豐財富等級", "永富"], ["往來資產規模(NTD)", "11,000,000"],
    ],
    deposits: [
      ["台幣活存", "—", "1,500,000", ["1,580,000","1,460,000","1,530,000"]],
      ["台幣定存", "定存 NTD 400萬・年利率1.6%・到期日2026/08/31", "4,000,000", ["4,000,000","4,000,000","4,000,000"]],
      ["外幣活存(NTD)", "USD 30,000", "900,000", ["900,000","900,000","900,000"]],
      ["外幣定存(NTD)", "USD 定存50,000・年利率4.2%・到期日2026/10/20", "1,500,000", ["1,500,000","1,500,000","1,500,000"]],
    ],
    investments: [
      { buy: "2023/09/12", cur: "美元", name: "摩根投資基金-多重收益基金", principal: 1400000, current: 1500000, dividend: 40000, series: [{ d: "5月底", current: 1530000, dividend: 25000 }, { d: "6月底", current: 1560000, dividend: 30000 }, { d: "7月底", current: 1540000, dividend: 35000 }] },
      { buy: "2025/02/10", cur: "美元", name: "PIMCO 全球投資級別債券基金", principal: 1000000, current: 1000000, dividend: 45000, series: [{ d: "5月底", current: 995000, dividend: 30000 }, { d: "6月底", current: 1000000, dividend: 35000 }, { d: "7月底", current: 1005000, dividend: 40000 }] },
      { cur: "美元", name: "核心大型股ETF（S&P 500）", principal: 500000, current: 600000, dividend: 8000, series: [{ d: "5月底", current: 585000, dividend: 4000 }, { d: "6月底", current: 610000, dividend: 6000 }, { d: "7月底", current: 625000, dividend: 7000 }] },
    ],
    liabilities: [["貸款(房貸，餘額)", "6,000,000"]],
    event: "費城半導體指數暴跌4.29%，引發台股加權指數重挫2,953點",
    defaultNeeds: [
      { strategy: "正向", text: "希望穩定收益投資比重高" },
      { strategy: "正向", text: "重視配置紀律" },
    ],
    defaultHistory: ["對申購手續費與經理費高度敏感"],
  },
  {
    id: "c3",
    tab: "案例3",
    type: "成長進取型",
    name: "張雅婷",
    profile: [
      ["姓名", "張雅婷"], ["性別", "女"], ["年齡", "33"], ["學歷", "碩博士"],
      ["工作", "半導體公司製程工程師"], ["PI客戶", "否"], ["推薦是否同意", "是"],
      ["風險等級", "RR5"], ["風險屬性評估日期", "2026/07/01"],
      ["永豐財富等級", "永聚"], ["往來資產規模(NTD)", "4,200,000"],
    ],
    deposits: [
      ["台幣活存", "—", "800,000", ["860,000","830,000","810,000"]],
      ["台幣定存", "定存 NTD 100萬・年利率1.6%・到期日2026/07/31", "1,000,000", ["1,000,000","1,000,000","1,000,000"]],
      ["外幣活存(NTD)", "USD 10,000", "300,000", ["300,000","300,000","300,000"]],
      ["外幣定存", "—", "0"],
    ],
    investments: [
      { buy: "2025/12/08", cur: "美元", name: "富蘭克林坦伯頓全球投資系列-科技基金美元A股", principal: 1000000, current: 800000, dividend: 0, series: [{ d: "5月底", current: 1060000, dividend: 0 }, { d: "6月底", current: 1110000, dividend: 0 }, { d: "7月底", current: 1020000, dividend: 0 }] },
      { buy: "2025/06/16", cur: "新臺幣", name: "國泰美國多重收益平衡基金", principal: 420000, current: 400000, dividend: 10000, series: [{ d: "5月底", current: 432000, dividend: 4000 }, { d: "6月底", current: 438000, dividend: 7000 }, { d: "7月底", current: 430000, dividend: 8500 }] },
      { cur: "美元", name: "那斯達克100指數ETF", principal: 600000, current: 500000, dividend: 2000, series: [{ d: "5月底", current: 640000, dividend: 1000 }, { d: "6月底", current: 668000, dividend: 1500 }, { d: "7月底", current: 630000, dividend: 1800 }] },
      { cur: "美元", name: "NVIDIA（單一個股）", principal: 520000, current: 400000, dividend: 2000, series: [{ d: "5月底", current: 560000, dividend: 1000 }, { d: "6月底", current: 600000, dividend: 1500 }, { d: "7月底", current: 545000, dividend: 1800 }] },
    ],
    liabilities: [["貸款(信貸，餘額)", "500,000"]],
    event: "費城半導體指數暴跌4.29%，引發台股加權指數重挫2,953點",
    defaultNeeds: [
      { strategy: "正向", text: "致電理專詢問美國股市大跌，部位虧損嚴重，想轉換部位" },
      { strategy: "正向", text: "定存今年7月到期，想投入投資市場" },
    ],
    defaultHistory: ["對本行態度差，服務理專常遭客訴"],
  },
];

/* 註：exampledata_new20260813v2 已移除「計價幣別」欄；各部位幣別（cur）依基金名稱
   與商品資訊於此維護，以符合「講述商品與金額務必標明幣別單位」之呈現規則。 */

/* ---------------- 新增項目預設選單（取自財富商品推薦表 B 欄） ---------------- */

const NEED_PRESETS = [
  "穩定收益需求",
  "保本傾向／定存偏好",
  "每月現金流需求",
  "資產成長／積極報酬需求",
  "外幣（美元）資產配置需求",
  "降波動需求",
  "目標理財需求（教育金／購屋／退休準備）",
  "虧損部位停損／轉換需求",
  "獲利了結需求",
  "到期資金再投資需求",
  "大額資金進場需求",
  "指名商品需求",
  "借貸資金投資需求【程序型】",
  "短期資金投資需求【程序型】",
];

const HISTORY_PRESETS = [
  "信任度高／對本行態度佳",
  "態度差／曾有客訴紀錄",
  "久未往來",
  "初次申購該商品類別",
  "費率敏感／常要求折讓",
  "比價／他行競爭",
  "提案後猶豫觀望",
  "定期定額停扣／中斷",
  "短線頻繁交易紀錄",
  "持倉集中度過高",
  "高齡往來程序（65歲以上）【程序型】",
  "曾有重大虧損經驗",
];

/* ---------------- 風險屬性評估效期檢核（1年） ---------------- */

const RISK_EXPIRE_MSG = "客戶風險屬性評估問卷已逾期須重新評估";

function riskDateInfo(cs) {
  const raw = (cs.profile.find(([k]) => k === "風險屬性評估日期") || [])[1] || "";
  const m = raw.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!m) return { raw, expired: false };
  const assess = new Date(+m[1], +m[2] - 1, +m[3]);
  const deadline = new Date(assess); deadline.setFullYear(deadline.getFullYear() + 1);
  return { raw, expired: new Date() > deadline };
}

/* ---------------- 財富商品推薦表：內部推理知識庫（濃縮版） ---------------- */

const KB = `
【商品推薦矩陣（代碼|名稱|風險|定位/配置角色|進場節奏|退休適配|優先客群P|優先事件M|優先需求N|優先歷程H）】
FND01|全球多元收益債券基金|RR1-3|穩定收益核心|單筆或分批|◎|P01,02,10,16,22,24|M01,04,21,23|N01,02,03,10|H03,04,12
FND02|投資等級債券基金|RR2-3|穩健核心|分批2-3期|◎|P02,06,10,15,16,19,21,22|M01,06,15,20,21,22,23|N01,06,08,09,10,11|H10
FND03|平衡型/多重資產基金|RR3-4|中樞配置|分批或定期定額|○限退休金充裕|P03,04,07,13,18,19|M05,07,08,14,16,18,19,22|N04,07,09,11|H07,10
FND04|全球股票/科技成長基金|RR4-5|成長衛星|小額定期定額禁重壓|✕|P05,09,13|M02,19|N04,12限適配|—
FND05|月配型收益基金|RR2-3|現金流|單筆可行首購小額|◎配息可能含本金|P01,10,11,16,22|M04,09,12,23|N01,03,10|H03,04
FND06|入門小額試單基金|RR1-3|試單啟動|小額單筆試單|○|P11,12,24|M09,10|N02試單|H03,04,07,12
BND01|美元投資等級公司債|RR2-3|收益核心|分批承接建到期階梯|◎|P02,06,21|M01,03,12|N01,05,10,11|—
BND02|短天期美元債/美國公債|RR1-2|防禦停泊|單筆停泊|◎|P01,04,07,08,14,15,17,24|M04,06,08,09,11,13,14,15,17,18,20,22,23|N06,08,10,11,14|H03,04,08,11
BND03|高收益/次順位債|RR4-5|收益增強衛星|限小比重|✕|限RR4-5具核心者|利差擴大後|—|—
BND04|小額入門海外債|RR1-2|入門試單|小額單筆|◎|P11,12,17,24|M03,09,10,11|N05試單|H03,04,12
SN01|連結美股保守息收SN|RR3-4|主題參與|單筆小比重確認鎖定期|△|P02,05|M02,07,16,19|N12次選承接|—
SN02|美股指數區間SN|RR3-5|收益策略|單筆小比重限成熟投資人|△|P09|M02,19|—|—
SN03|雙標的自動贖回SN|RR4-5|高風險衛星|單筆小比重嚴控集中|✕|P09|M19|—|—
SI01|美元保守息收SI|RR2-3|存款替代|單筆確認鎖定期|○|P02,08,10,11,12,14,21,22|M03,04,09,10,12|N02,10,11|H03,04,07
SI02|匯率區間SI|RR3-4|外幣效率|單筆先試算到價結果|△|P06|M11,12,25|N05限具匯率觀點|—
SI03|利率連結SI|RR2-4|過渡收益|單筆過渡配置|○|P10,14,21|M01,11,13|N02,10|H04
ETF01|核心大型股ETF|RR3-4|核心成長|分批或定期定額|△小比重|P03,04,05,13,19,20,23|M02,05,08,15,16,18,19|N04,09,12|H05,06,09,10
ETF02|高股息/價值ETF|RR2-4|收益防禦|分批股息再投入|○|P02,16|M01,07,13,14,18,21|N01,04,09|H05,06
ETF03|科技主題ETF/個股|RR4-5|高成長衛星|小額分批設比重上限|✕|P05,09,13,23|M02,19|N12限比重|—
ETF04|防禦型產業ETF|RR2-3|防守|單筆或分批承接移轉|○仍屬股票|P16|M06,14,15,17|N06,08|H10
ETF05|核心ETF定期定額|RR2-4|入門成長|定期定額波動期續扣|△限充裕小額|P12,13,18,20,23|M02,09,10,11,16,18|N04,07|H04,05,06,07,08,09

【客群態樣P（代碼|名稱|條件|優先商品）】
P01|退休保守現金流型|65+/RR1-2/高存款定存低股票|FND01,FND05,BND02,SI01
P02|穩健守成高資產型|50-70/RR2-3|BND01,FND02,SN01,SI01
P03|中年穩健累積型|40-55/RR2-4|FND03,BND01,ETF01
P04|有房貸現金流管理型|30-50/RR2-4|BND02,FND03,ETF01
P05|美股偏好成長型|30-45/RR4-5|ETF01,ETF03,FND04,SN01
P06|美元配置收益型|40-65/RR2-4|BND01,FND02,SI01,SI02
P07|事件驅動再配置型|不限/RR2-5新資金|FND03,FND02,ETF01,BND02依風險
P08|低波動美元停泊型|不限/RR1-2|BND02,SI01
P09|主題研究型投資人|30-55/RR4-5|ETF03,FND04,SN03
P10|存款轉投資過渡型|45-70/RR1-3|FND05,FND02,SI01,SI03
P11|久未往來重啟型|不限/RR1-3|FND05,BND02,SI01,FND06,ETF05
P12|陌生商品試單型|不限/RR1-4|FND06,BND04,ETF05,SI01
P13|高收入年輕專業型|28-40/RR3-5|ETF05,ETF01,FND04,FND03
P14|企業主/自營商型|35-65/RR2-4高流動性|BND02,SI01,FND02
P15|繼承/贈與大額資金型|不限/RR1-3先守後攻|BND02,FND02,FND05
P16|屆退準備型|55-65/RR2-3逐步降波動|FND02,FND05,ETF02
P17|高齡守護型|75+/RR1極簡|BND02,FND01;禁一切結構型與高波動
P18|子女教育金準備型|35-50/RR2-3目標日期導向|FND03,FND02,ETF05
P19|台股集中持股型|不限/RR3-5降集中度|ETF01,FND02,FND03
P20|短線頻繁交易型|25-50/RR4-5建立核心紀律|ETF01,ETF05
P21|外幣定存到期型|45-70/RR1-3|BND01,SI01,BND02
P22|保單滿期金再配置型|40-70/RR1-3|FND02,FND05,SI01
P23|數位自主研究型|25-45/RR3-5低成本透明|ETF01,ETF03,ETF05,BND04
P24|曾受傷風險趨避型|不限/RR1-2重建信心|BND02,FND06,FND01
※多重命中取風險最保守態樣為適配上限。

【市場事件M（代碼|事件|優先商品|提醒）】
M01|聯準會降息循環|BND01,FND02,FND03|勿把短錢配長債
M02|美股高檔震盪題材未變|ETF01,SN01,FND04|分批或SN降進場壓力
M03|台幣偏強想增美元|BND01,SI01,FND01|先釐清持有美元用途
M04|客戶剛退休|FND05,BND02,SI01|先盤點支出與預備金
M05|年終獎金入帳|FND03,ETF01,FND02|先核心衛星再主題
M06|波動擴大要求降波動|BND02,FND02,ETF04|降波動≠零風險
M07|偏好美股怕回檔|SN01,ETF02,FND03|先講SN最差情境
M08|有房貸投資金額有限|BND02,FND03,ETF01|先顧流動性
M09|久未往來熟悉度低|FND05,BND02,SI01|先重建信任小額試單
M10|未接觸此商品類別|FND06,BND04,SI01,ETF05|先教育再擴大
M11|美元走弱台幣轉強|FND01避險級別,BND02,BND04,ETF05|分「已持美元/持台幣」兩類溝通
M12|台幣走弱美元轉強|BND01,SI01,FND05|匯率與商品損益分開講
M13|重啟升息利率上行|BND02,SI03|短債停泊等待
M14|通膨超預期|BND02,ETF02,ETF04|短存續期優先
M15|股市系統性大跌|BND02,FND02,ETF04;次選核心ETF分批限相符|嚴防恐慌贖回、勿槓桿攤平、金額化最差情境、勿情緒化搶反彈
M16|創新高FOMO追高|FND03,ETF01|分批與再平衡取代擇時
M17|地緣政治風險|BND02,ETF04,FND02|幣別分散是合理回應
M18|重大選舉年|FND03,ETF01,BND02|分批取代猜結果
M19|科技財報期大波動|ETF01,FND03|財報前勿重壓單一個股;SN避開財報前夕
M20|債券信用事件|BND02,FND02|區分單一與系統性
M21|高配息商品調降配息|FND02,FND01|回到總報酬溝通,勿以配息率比價替換
M22|售屋大額入帳|BND02停泊再分批FND02,FND03|先停泊再分批
M23|退休金一次給付|FND05+FND02組合,BND02停泊|以年支出回推現金流
M24|聽信明牌/疑似詐騙|暫停一切交易,關懷查證通報(165)|一票否決
M25|日圓大幅波動|SI02|先確認日圓真實用途

【客戶需求N（代碼|需求|正向策略|反向策略啟用時機與方向）】
N01|穩定收益|FND01,FND02,FND05,BND01,BND02收益來源分散|收益期望脫離現實/追高配息時:總報酬溝通、降配息期望選淨值穩者
N02|保本/定存偏好|定存續存+BND02,SI01,SI03,BND04雙軌並存|定存過高遭通膨侵蝕/資金長期閒置時:僅轉出部分至低波動收益
N03|每月現金流|FND05,FND01,BND01,ETF02多元現金流|提領率不可持續(年提領>4-5%)時:下修月領或保留成長部位
N04|資產成長|ETF01,FND03,FND04,ETF03,ETF05先核心後衛星|市場過熱FOMO/屬性不符/已集中時:先建防禦核心、延後縮小成長配置
N05|外幣美元配置|BND01,BND02,SI01,BND04依用途定期限|高點想一次大額換匯/無用途追買時:分批換匯、縮額或延後
N06|降波動|BND02,FND02,ETF04,SI01調結構分批移轉|恐慌想全數退出時:核心不動、僅衛星減碼
N07|目標理財(教育金/購屋/退休)|FND03,FND02,ETF05累積,近目標轉BND02期限配對|目標時點近(<2-3年)仍想衝刺時:調整目標金額/時點而非提高風險
N08|虧損停損/轉換|邏輯已變:分批轉FND02,ETF01,BND02停泊|邏輯未變僅系統性波動時(最常見反向):不停損、續持或攤平限適配;提續持/減碼/轉換三案
N09|獲利了結|部分了結轉FND02,FND03再平衡|想全數清倉擇時再進場時:部分了結留住配置+回檔加碼條件
N10|到期資金再投資|FND02,SI01續作/BND02停泊/FND05承接|到期適逢劇烈波動急於全額投入時:先停泊六成再分批
N11|大額進場|BND02先停泊+FND02,FND03分2-3期|想一次全額進場時:先做六成留四成觀察
N12|指名商品|適配相符:分批控比重參與|不適配/與持倉重疊時:同主題降風險替代(科技個股→ETF01/FND03;美股怕波動→SN01次選)
N13|借貸投資【程序型】|——不提供正向策略|一律反向:不推薦任何標的、壓力試算(利率升+淨值跌的現金流缺口)、誠實告知非鼓勵作法
N14|短期資金【程序型】|BND02,存款,期限完全匹配之極短期SI|想以短錢買波動商品時一律反向:期限配對第一、合理報酬即近無風險利率

【本行往來歷程H（代碼|歷程|對應對的影響）】
H01|態度佳/信任高|可直接切入完整配置方案;仍不簡化風險揭露
H02|態度差/曾客訴|放慢節奏、留存完整紀錄、先修復服務體驗再談商品、建議更保守、限透明單純商品
H03|久未往來|先關懷盤點不急成交;KYC重確認;小額低波動破冰(FND05,BND02,FND06,SI01)
H04|初次申購該類別|教育優先;小額切入(FND06,BND04,ETF05,BND02);不得簡化揭露
H05|費率敏感|總持有成本溝通;ETF01,ETF02,BND02,持有至到期債,定期定額
H06|比價/他行競爭|承認差異,轉總成本與服務價值
H07|提案後猶豫|辨識卡點:金額大→降門檻/風險不安→更保守/信任不足→先給價值;禁限時話術
H08|定期定額停扣|48小時內關懷;提供降額不停扣
H09|短線頻繁交易|建立核心衛星紀律;交易成本累計金額化
H10|持倉集中>40%|不否定過去成功;分批移轉ETF01,FND02,FND03;壓力測試金額化;禁再推同質商品
H11|高齡65+【程序型】|程序即保護:關懷提問、放慢、家屬陪同、錄音錄影;限結構單純商品;程序優先於商品
H12|曾重大虧損經驗|重建信心優先;由極低波動小額開始;避免觸碰曾受傷類別

【決策流程】①客戶資料→P態樣(多重命中取最保守為上限)→②市場事件→M→③客戶需求→N(每項帶順序與正向/反向策略)→④本行往來歷程→H(只調整應對方式與呈現,不改變適配結論)→⑤取P×M×N優先商品交集為候選→⑥以矩陣適配符號覆核排序(✕硬性排除)→⑦一票否決:M24暫停交易;程序型N13,N14,H11先走程序→⑧交集為空依「客群>事件>需求」放寬,寧可回報無適配不可強行推薦。
【重要性排列】需求順序1最重要;未標示依「程序保護類→明示需求→時效性事件→行為特徵」推定並註明。三方向中至少兩個直接回應最高重要性需求(正向者滿足之、反向者反制之);犧牲高重要性滿足低重要性者可行性評中/低;難分高下以高重要性處理品質決勝;排列不得凌駕合規紅線。
【最終決策三選一鐵則】最終決策必須從三方向中完整挑選一項,禁止合併兩方向、禁止擷取落選方向元素組成混合方案。每個方向生成時即須為可獨立執行的完整策略(含配置、節奏、既有部位處理)。落選方向僅能以一句話「備用方案註記」帶過,不得展開。
`;

/* ---------------- Prompt 組裝 ---------------- */

function buildPrompt(cs, needs, history) {
  const inv = cs.investments
    .map((iv) => {
      const ret = ((iv.current + iv.dividend - iv.principal) / iv.principal) * 100;
      const retTxt = `${ret >= 0 ? "+" : ""}${ret.toFixed(1)}%`;
      const trend = (iv.series || []).slice().reverse().map((sp) => {
        const sr = ((sp.current + sp.dividend - iv.principal) / iv.principal) * 100;
        return `${sp.d} ${sr >= 0 ? "+" : ""}${sr.toFixed(1)}%`;
      }).join("、");
      return `- ${iv.name}（計價幣別：${iv.cur || "未註明"}${iv.buy ? `、申購時點：${iv.buy}` : ""}）：投資本金 NTD ${iv.principal.toLocaleString()}、投資現值 NTD ${iv.current.toLocaleString()}、累計配息 NTD ${iv.dividend.toLocaleString()}、含息報酬率 ${retTxt}${trend ? `（含息報酬率走勢由新至舊：最新 ${retTxt}、${trend}）` : ""}`;
    })
    .join("\n");
  const needsTxt = needs
    .filter((n) => n.text.trim())
    .map((n, i) => `順序${i + 1}（${n.strategy}策略）：${n.text}`)
    .join("\n");
  const histTxt = history.filter((h) => h.trim()).map((h) => `- ${h}`).join("\n");

  return `你是「Wealth Management AI Insight」財富管理分析引擎。請依下方財富商品推薦表知識庫，對客戶執行 ToT+CoT 混合推理並產出分析報告。

${KB}

【本次客戶輸入】
■ 客戶資料
${cs.profile.map(([k, v]) => `- ${k}：${v}`).join("\n")}
${riskDateInfo(cs).expired ? "- 【合規警示】風險屬性評估已超過1年效期：" + RISK_EXPIRE_MSG + "。報告之合規提醒須明確載明「須先完成風險屬性重新評估方可執行任何申購交易」，且所有配置建議均以完成重評為前提。" : "- 風險屬性評估仍在1年效期內。"}
- 分析基準日：${new Date().toLocaleDateString("zh-TW")}。【前置強制檢核，結果須呈現於報告】①風險等級效期（上列旗標；效期內但三個月內屆期者提醒預約重評）②定存到期：逐筆比對存款明細之到期日與分析基準日——已到期者視為「已入帳待配置資金」（時效高，事件分析與最終建議必須處理其去向）；一個月內到期者納入資金規劃時點。③存款餘額時序：有月底餘額資料時據以判讀現金流型態與支出習慣（穩定遞減→固定支出型、起伏交錯→薪資與房貸交錯型、持平→資金閒置），驗證流動性緩衝與月配需求的真實性（現金流無虞者不宜以月配為銷售切點）；單月大額異動須提示理專關懷詢問，不得逕行推測。
■ 存款
${cs.deposits.map(([k, d, v, ts]) => `- ${k}：${d !== "—" ? d + "，" : ""}最新 NTD ${v}${ts ? `（月底餘額由新至舊：7/31 ${ts[2]}、6/30 ${ts[1]}、5/31 ${ts[0]}）` : ""}`).join("\n")}
■ 投資（含損益）
${inv || "- 無投資部位"}
■ 負債
${cs.liabilities.map(([k, v]) => `- ${k}：NTD ${v}`).join("\n")}
■ 市場事件
${cs.event}
■ 客戶需求（依重要性排列，順序1最重要；每項標註正向或反向策略）
${needsTxt || "（未提供，請依客戶資料推定並註明）"}
■ 本行往來歷程（關係脈絡，無順序屬性）
${histTxt || "（未提供）"}

【策略方向定義（必須嚴格執行）】
- 正向策略：依該客戶需求生成建議——建議須順著需求、直接滿足它。
- 反向策略：與該客戶需求「背道而馳」生成建議——刻意提出與需求相反的方案（例如需求為想全數轉換停損，反向即建議不轉換/續持/反向操作）。反向建議須：(1)在報告中明確標示為反向策略建議；(2)說明為何違背字面需求反而符合客戶利益；(3)給理專「先肯定需求背後動機、再提反向方案與依據」的溝通框架。反向需求須有至少一個ToT方向刻意反制它並完整推導。
- 【策略標記強制約束】三個方向與最終決策全部必須符合每項需求的標記：正向標記的需求，所有方向一律順應滿足之，不得生成反制、違背或質疑該需求的策略內容（例如「注重穩定收益（正向）」時不得出現承受波動追求成長之方向）；反向標記的需求才啟用反向策略。KB中N表的反向策略欄僅在該需求被標記為反向時參照，不得自行判斷時機而反向處理正向需求。三方向差異須來自達成路徑不同（商品組合/進場節奏/比重/核心衛星結構/幣別期限），而非順應vs反制的對立。
- 正向或反向皆不得凌駕合規與適配性檢核（M24、N13、N14、H11程序型優先於任何標記）。
【本行往來歷程的作用】不參與需求順位；作為關係脈絡：(1)比對行為情境；(2)調整理專應對——態度佳可直接切入配置、態度差或有客訴紀錄須放慢節奏、留存完整紀錄、先修復服務體驗再談商品且建議應更保守；(3)只改變接觸方式與話術，不改變商品適配結論。

【輸出要求】
1. 報告以「給理專觀看」為標準：P/M/S代碼、商品代碼、交集查表過程、適配符號一律不得出現在報告中；客群以名稱白話描述、商品以策略子類型名稱呈現、規則轉譯為業務語言。內部推理仍須嚴格依知識庫查核。若推理過程參考任何市場新聞、投顧報告或研究資料，報告中一律不顯示所引用的資料名稱、期數與日期（不得出現「依XX月報」「依X/X市場資訊」等字樣），以「當時市場氛圍」「市場研究觀點」「當前市場展望」等中性描述呈現，且僅供理專溝通參考、不得作為保證性陳述。講述商品與金額時**務必標明幣別單位**：金額一律註明計價單位（如 NTD 1,000,000、USD 10,000、NTD 80萬），商品名稱首次提及時附註計價幣別（如「富蘭克林坦伯頓科技基金（美元計價）」）；建議配置的金額與比重同樣須帶幣別；資料未註明幣別時以新臺幣計並註明。
2. 【篇幅要求（最高優先）】本報告為快速摘要版：全文以 900-1,300 字為上限。所有內容以精簡句直述結論與關鍵依據，禁止鋪陳與重複。具體限制：客戶輪廓每小節 1-2 句；事件衝擊逐部位各 1 句（可用精簡表格）；每方向 CoT 三步各 1 句、可行性/優勢/風險/理專建議各 1 句；最終決策之配置建議用精簡表格（標的/金額或比重/節奏各一欄）、需求回顧每項 1 行、理專應對與風險說明各 2-3 條短句。
3. 嚴格依以下 Markdown 結構輸出（用 ### 作段落標題），各段內容依上述篇幅簡述：
### 👤 客戶輪廓分析
基本輪廓（含風險等級評估日期與效期狀態）／資產結構（含定存到期日、各投資部位明細與負債）／客群投資行為（整併客群定位與投資行為解讀，依序兩段：1.客群定位與心態推測依固定推導鏈執行（順序不可顛倒）：①客戶背景（依基本輪廓與資產結構定位客群、說明風險等級對商品範圍有無限制）（有基金申購時點資料時於①一併判讀進場行為：對照申購當時市場位階與氛圍——多頭高檔追價申購→從眾進場傾向、波動期低檔布局→紀律傾向、長期持有起點→信任基礎；進場判讀作為心態基線供②延續比對，遵守用語紅線）→②近三月時序資料＝行為×當時市場氛圍交叉判讀（標定每個行為轉折點：獲利高點/回落起點/由盈轉虧點/持續無動作，逐一判讀：與主流敘事一致→從眾、有節制建議未行動→選擇性吸收、矛盾→存疑；無氛圍資訊時僅依行為軌跡判讀並註明；每個轉折點產出判讀結論直接餵給③）→③推測客戶情緒（由①背景與②各判讀結論推導當下情緒：回吐懊悔/焦慮/急迫/不信任/被驗證的信心，每項情緒註明來自②哪個判讀；遵守用語紅線：推測語氣、中性、不究責）→④衍生相關需求（推導未明說的潛在需求如重建紀律/被理解/資訊確認，與明示需求對照；紅線：衍生需求僅供溝通與方案細節參考，不得改變明示需求順序與正反向標記、不得憑其擴大商品範圍）；2.再分析投資損益——計算並彙總總投資本金、總投資現值、總投資含息報酬率（內部以（總現值+總配息-總本金)/總本金計算，報告中不呈現計算過程與公式、直接顯示結果數字）並對照個別部位，接著檢視風險有無分散：是否過度集中單一商品種類/市場/產業/個股，計算集中度占比並金額化，指出集中結構與損益結果的因果關係；**有近三月底時序資料時須加入損益趨勢與轉折點分析**（時序數字一律以 Markdown 表格呈現、時點各自成欄並以**降冪**排列（由最新至最舊）：｜項目｜計價幣別｜最新｜7月底｜6月底｜5月底｜，禁止以箭頭串接成長字串）——獲利高點、回落起點、由盈轉虧時點，並回饋至心態推測：獲利高點未停利未再平衡→動能信念強缺乏停利紀律、回落未行動轉虧才求助→錨定前高的處分效應、行動門檻在由盈轉虧而非風險升高；後續理專溝通須針對「獲利回吐的懊悔感」而不僅是帳面虧損）
### 🎯 初始事件分析
事件核心／對客戶既有部位的直接衝擊（逐部位）／心理與決策的間接影響／客戶需求逐項列出重要性順位、策略方向（正向/反向）與決策意涵（含系統偵測項，註明推定）／本行往來歷程之關係脈絡解讀與應對影響
### 🌿 思維樹展開與深度推導 (ToT + CoT)
三個截然不同方向，每方向必須是可獨立執行的完整策略（含配置、節奏、既有部位處理），含：方向名稱／思考鏈(CoT)三步：1.檢視客戶屬性與資產現況 2.推演市場環境連帶效應 3.評估最大回撤與合規風險／可行性【高/中/低】＋白話依據／策略優勢／潛在風險／理專應對建議。至少一方向可行性為中或低（依路徑執行品質與市場契合度評定）。至少兩方向直接回應最高重要性需求。三方向全部須符合每項需求之正向/反向標記。
### 🏆 最終決策與修剪
最佳方向（【三選一鐵則】必須從三方向中完整挑選一項，禁止合併兩方向或擷取落選方向元素組成混合方案；落選方向至多以一句話備用方案註記帶過）／選擇原因（比較修剪＋高重要性滿足度）／對應理財商品類型／最終具體買賣與配置建議（商品名稱、金額或比重、進場節奏、幣別、既有部位處理、需求逐項回顧表（正向:滿足/部分滿足/擱置；反向:反制方案與依據））／理專應對建議（接觸時機、話術切入）／風險說明（市場/匯率/流動性/合規；末尾註明本報告為初步框架性建議仍須完成KYC與適配性評估）
4. 合規紅線：不得保證匯率報酬解套；配息不等於保本；65歲以上提示高齡程序；指名商品不免除適配；虧損處置先診斷邏輯是否改變；疑似詐騙一票否決。
5. 直接輸出報告本體，不要任何前言或說明。`;
}

/* ---------------- 極簡 Markdown 渲染 ---------------- */

function renderInline(txt, key) {
  const parts = txt.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={`${key}-${i}`} style={{ color: C.pineDeep }}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={`${key}-${i}`}>{p}</span>
    )
  );
}

function Markdown({ text }) {
  const lines = text.split("\n");
  const out = [];
  let i = 0, k = 0;
  const feasColor = (s) =>
    s.includes("【高】") || /可行性[:：].*高/.test(s) ? C.green :
    s.includes("【低】") || /可行性[:：].*低/.test(s) ? C.red : C.amber;

  while (i < lines.length) {
    const ln = lines[i];

    if (/^\s*\|/.test(ln)) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i]))
          rows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
        i++;
      }
      if (rows.length) {
        const [head, ...body] = rows;
        out.push(
          <div key={k++} style={{ overflowX: "auto", margin: "10px 0" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
              <thead><tr>{head.map((h, j) => (
                <th key={j} style={{ background: C.pine, color: "#fff", padding: "7px 10px", textAlign: "left", fontWeight: 600, border: `1px solid ${C.pine}` }}>{h}</th>
              ))}</tr></thead>
              <tbody>{body.map((r, ri) => (
                <tr key={ri} style={{ background: ri % 2 ? "#F8F5EC" : "#fff" }}>
                  {r.map((c, ci) => (
                    <td key={ci} style={{ padding: "7px 10px", border: `1px solid ${C.line}`, verticalAlign: "top" }}>{renderInline(c, `t${ri}${ci}`)}</td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    if (/^###\s/.test(ln)) {
      out.push(
        <h3 key={k++} style={{ fontFamily: font.serif, fontSize: 21, color: C.pineDeep, margin: "26px 0 10px", paddingBottom: 8, borderBottom: `2px solid ${C.gold}` }}>
          {ln.replace(/^###\s*/, "")}
        </h3>
      );
    } else if (/^####\s/.test(ln)) {
      out.push(<h4 key={k++} style={{ fontSize: 15.5, color: C.pine, margin: "18px 0 6px", fontWeight: 700 }}>{ln.replace(/^####\s*/, "")}</h4>);
    } else if (/^\s*[-*•]\s/.test(ln)) {
      out.push(
        <div key={k++} style={{ display: "flex", gap: 8, margin: "4px 0 4px 6px", lineHeight: 1.75 }}>
          <span style={{ color: C.gold, flexShrink: 0 }}>◆</span>
          <span>{renderInline(ln.replace(/^\s*[-*•]\s/, ""), `b${k}`)}</span>
        </div>
      );
    } else if (/^\s*\d+\.\s/.test(ln)) {
      const num = ln.match(/^\s*(\d+)\./)[1];
      out.push(
        <div key={k++} style={{ display: "flex", gap: 8, margin: "4px 0 4px 6px", lineHeight: 1.75 }}>
          <span style={{ color: C.pine, fontWeight: 700, flexShrink: 0 }}>{num}.</span>
          <span>{renderInline(ln.replace(/^\s*\d+\.\s/, ""), `n${k}`)}</span>
        </div>
      );
    } else if (/【方向\s*[ABC甲乙丙]/.test(ln)) {
      out.push(
        <div key={k++} style={{ fontFamily: font.serif, fontSize: 17, fontWeight: 700, color: "#fff", background: C.pine, padding: "8px 14px", borderRadius: 6, margin: "20px 0 10px" }}>
          {ln.replace(/[#*]/g, "").trim()}
        </div>
      );
    } else if (/可行性/.test(ln) && /[高中低]/.test(ln)) {
      out.push(
        <div key={k++} style={{ margin: "6px 0", padding: "6px 12px", background: `${feasColor(ln)}14`, borderLeft: `4px solid ${feasColor(ln)}`, borderRadius: 4, lineHeight: 1.7 }}>
          {renderInline(ln.replace(/[#*]/g, ""), `f${k}`)}
        </div>
      );
    } else if (ln.trim()) {
      out.push(<p key={k++} style={{ margin: "7px 0", lineHeight: 1.85 }}>{renderInline(ln, `p${k}`)}</p>);
    }
    i++;
  }
  return <div style={{ fontSize: 14.5, color: C.ink }}>{out}</div>;
}

/* ---------------- 主元件 ---------------- */

export default function App() {
  const [caseId, setCaseId] = useState("c1");
  const [needsMap, setNeedsMap] = useState(() =>
    Object.fromEntries(CASES.map((c) => [c.id, c.defaultNeeds.map((n) => ({ ...n }))]))
  );
  const [historyMap, setHistoryMap] = useState(() =>
    Object.fromEntries(CASES.map((c) => [c.id, c.defaultHistory.slice()]))
  );
  const [reports, setReports] = useState({});     // caseId -> {text, needsSnapshot, time}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reportRef = useRef(null);

  const cs = CASES.find((c) => c.id === caseId);
  const needs = needsMap[caseId];
  const history = historyMap[caseId];
  const report = reports[caseId];

  const stale = useMemo(() => {
    if (!report) return false;
    const curN = needs.filter((n) => n.text.trim());
    const curH = history.filter((h) => h.trim());
    return (
      JSON.stringify(curN) !== JSON.stringify(report.needsSnapshot) ||
      JSON.stringify(curH) !== JSON.stringify(report.historySnapshot)
    );
  }, [needs, history, report]);

  const setNeeds = (fn) =>
    setNeedsMap((m) => ({ ...m, [caseId]: fn(m[caseId]) }));
  const setHistory = (fn) =>
    setHistoryMap((m) => ({ ...m, [caseId]: fn(m[caseId]) }));

  const move = (i, d) =>
    setNeeds((arr) => {
      const a = arr.slice();
      const j = i + d;
      if (j < 0 || j >= a.length) return arr;
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });

  async function run() {
    const cur = needs.filter((n) => n.text.trim());
    const curH = history.filter((h) => h.trim());
    if (!cur.length) { setError("請至少輸入一項客戶需求。"); return; }
    setError(""); setLoading(true);
    try {
      const callApi = async (messages) => {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 3000, messages }),
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error.message || "API 回傳錯誤");
        return data;
      };

      const prompt = buildPrompt(cs, cur, curH);
      let text = "";
      // 自動接續：若因長度上限中斷，帶已產出內容請模型從中斷處繼續，最多接續 3 次
      for (let round = 0; round < 4; round++) {
        const messages =
          round === 0
            ? [{ role: "user", content: prompt }]
            : [
                { role: "user", content: prompt },
                { role: "assistant", content: text },
                { role: "user", content: "報告尚未輸出完畢。請從上一段中斷處直接接續輸出剩餘內容，不要重複已輸出的文字，也不要加任何前言或說明。" },
              ];
        const data = await callApi(messages);
        text += (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
        if (data.stop_reason !== "max_tokens") break;
      }
      if (!text.trim()) throw new Error("未取得分析內容，請重試");
      setReports((r) => ({
        ...r,
        [caseId]: {
          text,
          needsSnapshot: cur.map((n) => ({ ...n })),
          historySnapshot: curH.slice(),
          time: new Date().toLocaleString("zh-TW", { hour12: false }),
        },
      }));
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (e) {
      setError(`分析失敗：${e.message}。請重新執行分析。`);
    } finally {
      setLoading(false);
    }
  }

  const fmt = (n) => n.toLocaleString();
  const retOf = (iv) => ((iv.current + iv.dividend - iv.principal) / iv.principal) * 100;

  const thS = { background: C.pine, color: "#fff", padding: "7px 10px", textAlign: "left", fontWeight: 600, fontSize: 12.5, whiteSpace: "nowrap" };
  const tdS = { padding: "7px 10px", borderBottom: `1px solid ${C.line}`, fontSize: 13, verticalAlign: "top" };
  const secTitle = (icon, txt, note) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
      <span style={{ fontFamily: font.serif, fontSize: 17, fontWeight: 700, color: C.pineDeep }}>{icon} {txt}</span>
      {note && <span style={{ fontSize: 11.5, color: C.gray, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 20, padding: "2px 10px" }}>{note}</span>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.paper, fontFamily: font.body, color: C.ink }}>
      <style>{`
        button:focus-visible, textarea:focus-visible { outline: 3px solid ${C.gold}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce){ *{transition:none!important;animation:none!important} }
        @keyframes pulse { 0%,100%{opacity:.45} 50%{opacity:1} }
      `}</style>

      {/* ===== 頁首 ===== */}
      <header style={{ background: "#FFFFFF", color: C.ink, padding: "22px 28px", borderBottom: `4px solid ${C.gold}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: C.gray, fontWeight: 700, marginBottom: 4 }}>WEALTH MANAGEMENT AI INSIGHT</div>
            <h1 style={{ fontFamily: font.serif, fontSize: 26, margin: 0, fontWeight: 700, color: C.gold }}>事件驅動客戶分析</h1>
          </div>
          <div style={{ fontSize: 12, color: C.gray }}>ToT＋CoT 混合推理｜依財富商品推薦表｜理專內部使用</div>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "22px 20px 60px" }}>

        {/* ===== 案例選擇 ===== */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {CASES.map((c) => {
            const active = c.id === caseId;
            return (
              <button key={c.id} onClick={() => { setCaseId(c.id); setError(""); }}
                style={{
                  flex: "1 1 200px", textAlign: "left", cursor: "pointer", borderRadius: 10, padding: "12px 16px",
                  border: active ? `2px solid ${C.pine}` : `1px solid ${C.line}`,
                  background: active ? "#fff" : "#FDFDFC",
                  boxShadow: active ? "0 3px 10px rgba(14,87,72,.14)" : "none", transition: "all .15s",
                }}>
                <div style={{ fontSize: 11.5, color: active ? C.gold : C.gray, fontWeight: 700, letterSpacing: 1 }}>{c.tab}｜{c.type}</div>
                <div style={{ fontFamily: font.serif, fontSize: 18, fontWeight: 700, color: active ? C.pineDeep : C.ink, marginTop: 2 }}>
                  {c.name}<span style={{ fontSize: 12, fontWeight: 400, color: C.gray, marginLeft: 8 }}>{c.profile[4][1]}・{c.profile[5][1]}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,7fr) minmax(0,5fr)", gap: 18, alignItems: "start" }}>

          {/* ===== 左：唯讀客戶檔案 ===== */}
          <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px 20px" }}>
            {secTitle("📋", "客戶資料", "唯讀・來源 exampledata_new20260813v2")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, marginBottom: 16 }}>
              {cs.profile.map(([k, v]) => {
                if (k === "風險屬性評估日期") {
                  const { expired } = riskDateInfo(cs);
                  return (
                    <div key={k} style={{ background: expired ? C.redSoft : C.paper, border: expired ? `1px solid #E5B9AE` : "none", borderRadius: 8, padding: "8px 12px", gridColumn: expired ? "span 2" : "auto" }}>
                      <div style={{ fontSize: 11, color: expired ? C.red : C.gray }}>{k}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: expired ? C.red : C.pineDeep }}>{v}</div>
                      {expired && (
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: C.red, marginTop: 3, lineHeight: 1.5 }}>
                          ⚠ {RISK_EXPIRE_MSG}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div key={k} style={{ background: C.paper, borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 11, color: C.gray }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.pineDeep }}>{v}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.pine, margin: "12px 0 6px" }}>存款部位</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thS}>類別</th><th style={thS}>明細</th><th style={{ ...thS, textAlign: "right" }}>最新(NTD)</th><th style={{ ...thS, textAlign: "right", fontSize: 11.5 }}>7月底</th><th style={{ ...thS, textAlign: "right", fontSize: 11.5 }}>6月底</th><th style={{ ...thS, textAlign: "right", fontSize: 11.5 }}>5月底</th></tr></thead>
              <tbody>{cs.deposits.map(([k, d, v, ts], i) => (
                <tr key={k} style={{ background: i % 2 ? "#F8F5EC" : "#fff" }}>
                  <td style={tdS}>{k}</td>
                  <td style={{ ...tdS, color: C.gray }}>{d}</td>
                  <td style={{ ...tdS, textAlign: "right", fontWeight: 700 }}>{v}</td>
                  {(ts ? ts.slice().reverse() : ["—", "—", "—"]).map((m, mi) => (
                    <td key={mi} style={{ ...tdS, textAlign: "right", color: C.gray, fontVariantNumeric: "tabular-nums" }}>{m}</td>
                  ))}
                </tr>
              ))}
              </tbody>
            </table>

            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.pine, margin: "16px 0 6px" }}>投資部位（含損益）</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr>
                    <th style={thS} rowSpan={2}>投資項目</th>
                    <th style={{ ...thS, textAlign: "center" }} rowSpan={2}>計價幣別</th>
                    <th style={{ ...thS, textAlign: "center" }} rowSpan={2}>申購時點</th>
                    <th style={{ ...thS, textAlign: "right" }} rowSpan={2}>投資本金(NTD)</th>
                    <th style={{ ...thS, textAlign: "right" }} rowSpan={2}>投資現值(NTD)</th>
                    <th style={{ ...thS, textAlign: "right" }} rowSpan={2}>累計配息(NTD)</th>
                    <th style={{ ...thS, textAlign: "center", borderBottom: `1px solid rgba(255,255,255,.4)` }} colSpan={4}>含息報酬率走勢（由新至舊）</th>
                  </tr>
                  <tr>
                    {["最新", "7月底", "6月底", "5月底"].map((m) => (
                      <th key={m} style={{ ...thS, textAlign: "right", fontSize: 11.5 }}>{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cs.investments.map((iv, i) => {
                    const r = ((iv.current + iv.dividend - iv.principal) / iv.principal) * 100;
                    const pl = (v) => (v >= 0 ? C.gain : C.loss);
                    return (
                      <tr key={iv.name} style={{ background: i % 2 ? "#F8F5EC" : "#fff" }}>
                        <td style={tdS}>{iv.name}</td>
                        <td style={{ ...tdS, textAlign: "center", color: C.gray }}>{iv.cur || "—"}</td>
                        <td style={{ ...tdS, textAlign: "center", color: C.gray, fontSize: 11.5 }}>{iv.buy || "—"}</td>
                        <td style={{ ...tdS, textAlign: "right" }}>{iv.principal.toLocaleString()}</td>
                        <td style={{ ...tdS, textAlign: "right" }}>{iv.current.toLocaleString()}</td>
                        <td style={{ ...tdS, textAlign: "right" }}>{iv.dividend.toLocaleString()}</td>
                        <td style={{ ...tdS, textAlign: "right", fontWeight: 800, fontVariantNumeric: "tabular-nums", color: pl(r), background: r >= 0 ? "#FBECEA" : "#EDF5EE" }}>
                          {r >= 0 ? "+" : ""}{r.toFixed(1)}%
                        </td>
                        {(iv.series || []).slice().reverse().map((sp, si) => {
                          const sr = ((sp.current + sp.dividend - iv.principal) / iv.principal) * 100;
                          return (
                            <td key={si} style={{ ...tdS, textAlign: "right", fontVariantNumeric: "tabular-nums", color: pl(sr) }}>
                              {sr >= 0 ? "+" : ""}{sr.toFixed(1)}%
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.pine, margin: "16px 0 6px" }}>負債</div>
            {cs.liabilities.map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 2px", borderBottom: `1px solid ${C.line}` }}>
                <span>{k}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop: 18, background: C.goldSoft, border: `1px solid #EBD6BF`, borderRadius: 10, padding: "12px 14px" }}>
              {secTitle("📡", "市場事件", "唯讀")}
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "#6B5C4F" }}>{cs.event}</div>
            </div>
          </section>

          {/* ===== 右：可編輯需求 ＋ 執行 ===== */}
          <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px 20px", position: "sticky", top: 16 }}>
            {secTitle("✏️", "客戶需求", "可編輯・依重要性排列・正向/反向策略")}
            <div style={{ fontSize: 12, color: C.gray, marginBottom: 12, lineHeight: 1.6 }}>
              順序 1 為最重要。<b style={{ color: C.pine }}>正向策略</b>＝依需求生成建議；
              <b style={{ color: C.red }}>反向策略</b>＝與需求背道而馳生成建議（報告將標示反向依據與溝通框架）。
            </div>

            {needs.map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "stretch" }}>
                <div style={{ width: 52, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.pine, color: "#fff", borderRadius: 8, fontWeight: 800 }}>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>順序</span>
                  <span style={{ fontSize: 18, fontFamily: font.serif }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["正向", "反向"].map((sg) => {
                      const active = n.strategy === sg;
                      const clr = sg === "正向" ? C.pine : C.red;
                      return (
                        <button key={sg}
                          onClick={() => setNeeds((arr) => arr.map((x, j) => (j === i ? { ...x, strategy: sg } : x)))}
                          style={{
                            padding: "3px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                            border: `1.5px solid ${active ? clr : C.line}`,
                            background: active ? clr : "#fff", color: active ? "#fff" : C.gray,
                          }}>
                          {sg}策略
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    value={n.text}
                    onChange={(e) => setNeeds((arr) => arr.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                    rows={2}
                    placeholder="輸入客戶需求…"
                    style={{ resize: "vertical", border: `1px solid ${n.strategy === "反向" ? "#E8B4AD" : C.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: font.body, lineHeight: 1.6, background: n.strategy === "反向" ? "#FFFBF9" : "#FDFDFC" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
                  <button onClick={() => move(i, -1)} disabled={i === 0} title="提高順位"
                    style={{ border: `1px solid ${C.line}`, background: "#fff", borderRadius: 6, cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.35 : 1, padding: "2px 8px", fontSize: 13 }}>▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === needs.length - 1} title="降低順位"
                    style={{ border: `1px solid ${C.line}`, background: "#fff", borderRadius: 6, cursor: i === needs.length - 1 ? "default" : "pointer", opacity: i === needs.length - 1 ? 0.35 : 1, padding: "2px 8px", fontSize: 13 }}>▼</button>
                  <button onClick={() => setNeeds((arr) => arr.filter((_, j) => j !== i))} disabled={needs.length <= 1} title="刪除此項"
                    style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.red, borderRadius: 6, cursor: needs.length <= 1 ? "default" : "pointer", opacity: needs.length <= 1 ? 0.35 : 1, padding: "2px 8px", fontSize: 13 }}>✕</button>
                </div>
              </div>
            ))}

            <select
              value=""
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                setNeeds((arr) => [...arr, { strategy: "正向", text: v === "__custom__" ? "" : v }]);
              }}
              style={{ width: "100%", border: `1.5px dashed ${C.pine}`, color: C.pine, background: "transparent", borderRadius: 8, padding: "9px 8px", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: font.body, appearance: "auto" }}>
              <option value="" disabled>＋ 新增需求項目（選擇預設內容，加入後可再編輯）</option>
              {NEED_PRESETS.map((o) => <option key={o} value={o}>{o}</option>)}
              <option value="__custom__">✎ 自行輸入需求內容…</option>
            </select>

            {secTitle("🤝", "本行往來歷程", "可編輯・關係脈絡（無順序）")}
            <div style={{ fontSize: 12, color: C.gray, marginBottom: 10, lineHeight: 1.6 }}>
              不參與需求順位；用於調整理專應對方式（接觸節奏、話術、紀錄要求），不改變商品適配結論。
            </div>
            {history.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <textarea
                  value={h}
                  onChange={(e) => setHistory((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                  rows={1}
                  placeholder="輸入往來歷程（如：對本行態度佳、常遭客訴、費率敏感…）"
                  style={{ flex: 1, resize: "vertical", border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontFamily: font.body, lineHeight: 1.6, background: "#FDFDFC" }}
                />
                <button onClick={() => setHistory((arr) => arr.filter((_, j) => j !== i))} disabled={history.length <= 1} title="刪除此項"
                  style={{ border: `1px solid ${C.line}`, background: "#fff", color: C.red, borderRadius: 6, cursor: history.length <= 1 ? "default" : "pointer", opacity: history.length <= 1 ? 0.35 : 1, padding: "2px 10px", fontSize: 13, alignSelf: "center" }}>✕</button>
              </div>
            ))}
            <select
              value=""
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                setHistory((arr) => [...arr, v === "__custom__" ? "" : v]);
              }}
              style={{ width: "100%", border: `1.5px dashed ${C.gray}`, color: C.gray, background: "transparent", borderRadius: 8, padding: "8px", cursor: "pointer", fontSize: 12.5, fontWeight: 600, marginBottom: 14, fontFamily: font.body, appearance: "auto" }}>
              <option value="" disabled>＋ 新增往來歷程（選擇預設內容，加入後可再編輯）</option>
              {HISTORY_PRESETS.map((o) => <option key={o} value={o}>{o}</option>)}
              <option value="__custom__">✎ 自行輸入往來歷程…</option>
            </select>

            {stale && (
              <div style={{ background: C.amberSoft, border: `1px solid #EBD3A6`, borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: C.amber, marginBottom: 12, lineHeight: 1.6 }}>
                ⚠ 客戶需求或本行往來歷程已變更，下方分析報告與目前輸入不一致。請重新執行分析，報告將依更新後內容重新推理。
              </div>
            )}
            {error && (
              <div style={{ background: C.redSoft, border: `1px solid #E5B9AE`, borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: C.red, marginBottom: 12 }}>{error}</div>
            )}

            <button onClick={run} disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none", cursor: loading ? "wait" : "pointer",
                background: loading ? C.gray : `linear-gradient(135deg, ${C.pine}, ${C.pineDeep})`,
                color: "#fff", fontSize: 15.5, fontWeight: 800, letterSpacing: 2,
                boxShadow: loading ? "none" : "0 4px 14px rgba(14,87,72,.3)",
              }}>
              {loading ? "分析引擎推理中…" : stale || report ? "重新執行分析" : "執行分析"}
            </button>
            {loading && (
              <div style={{ marginTop: 10, fontSize: 12, color: C.gray, animation: "pulse 1.6s infinite", lineHeight: 1.7 }}>
                正在比對客群態樣、展開三方向思維樹並依需求順位修剪，快速摘要版約需 30–60 秒…
              </div>
            )}
          </section>
        </div>

        {/* ===== 分析報告 ===== */}
        {report && (
          <section ref={reportRef} style={{ marginTop: 22, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", opacity: stale ? 0.55 : 1, transition: "opacity .2s" }}>
            <div style={{ background: C.pineDeep, color: "#fff", padding: "14px 22px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <div style={{ fontFamily: font.serif, fontSize: 18, fontWeight: 700 }}>
                📑 AI 分析報告｜{cs.tab}_{cs.type}｜{cs.name}
              </div>
              <div style={{ fontSize: 11.5, color: "#F0DCD8" }}>產製時間 {report.time}{stale && "（已過期，請重新執行）"}</div>
            </div>
            <div style={{ padding: "6px 24px 14px", borderBottom: `1px solid ${C.line}`, background: "#FAF8F1", fontSize: 12, color: C.gray, lineHeight: 1.7 }}>
              <b style={{ color: C.pine }}>本次分析採用之客戶需求：</b>
              {report.needsSnapshot.map((n, i) => ` 順序${i + 1}〔${n.strategy}〕「${n.text}」`).join("；")}
              {report.historySnapshot?.length ? <>｜<b style={{ color: C.pine }}>往來歷程：</b>{report.historySnapshot.join("；")}</> : null}
            </div>
            <div style={{ padding: "12px 26px 30px" }}>
              <Markdown text={report.text} />
            </div>
          </section>
        )}

        {!report && !loading && (
          <div style={{ marginTop: 22, border: `1.5px dashed ${C.line}`, borderRadius: 12, padding: "36px 20px", textAlign: "center", color: C.gray, fontSize: 14 }}>
            確認左側客戶資料與市場事件、調整右側需求順位後，點擊「執行分析」即可產製 ToT＋CoT 分析報告。
          </div>
        )}
      </main>
    </div>
  );
}
