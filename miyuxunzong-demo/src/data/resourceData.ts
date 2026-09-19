import type { CharacterCard, MorseChallenge, Quiz } from '../types'

export interface ShopItem {
  id: string
  name: string
  description: string
  detail?: string
  image?: string
  emoji?: string
  price: number
}

export const itemCatalog: ShopItem[] = [
  { id: 'wuchang_note', name: '武昌联络纸条', description: '指向武昌联络点的紧急纸条。', detail: '纸条上用暗写墨水标记了联络点的街道与门牌号，仅在紫外灯下显现。', emoji: '📜', price: 0 },
  { id: 'classmate_letter', name: '无名同学来信', description: '指向长沙临时大学的匿名来信。', detail: '信中夹带一片梧桐叶，暗示接应地点在岳麓山下的梧桐小径。', emoji: '✉️', price: 0 },
  { id: 'silver_coin', name: '银元', description: '旅途中可使用的硬通货。', detail: '民国年间流通的袁大头，在战乱年代比纸币更易被接受。', emoji: '🪙', price: 0 },
  { id: 'ration', name: '干粮', description: '一次远行所需的干粮。', detail: '粗面饼干与腌萝卜干，携带方便，可维持数日。', emoji: '🍞', price: 0 },
  { id: 'quinine', name: '奎宁药片', description: '治疗疟疾和水土不服。', detail: '热带地区的救命药，副作用是耳鸣，但能对抗疟疾。', emoji: '💊', price: 0 },
  { id: 'amulet', name: '护身符', description: '怀疑值达到 12 时可降低 2 点怀疑。', detail: '据说由北平白云观道士开光，戴上后行事更为谨慎，旁人少生疑心。', emoji: '🧿', price: 8 },
  { id: 'revive_card', name: '原地复活卡', description: '失败结局时从当前章节检查点重试。', detail: '在身份暴露或任务失败时使用，回到本章节最近一次检查点继续，避免从头再来。', emoji: '🪦', price: 12 },
  { id: 'rebound_card', name: '触底反弹卡', description: '怀疑值达到 10 后可使用，降低 5 点。', detail: '危急关头扭转局面，让原本对你高度怀疑的对象暂时放下戒备。', emoji: '🏓', price: 10 },
  { id: 'explore_card', name: '探索卡', description: '解锁一次任意情报站任务。', detail: '获得一小时自由探索权限，可以前往情报站执行额外任务获取奖励。', emoji: '🗺️', price: 15 },
  { id: 'mem_emergency_rule', name: '记忆档案·紧急联络规则', description: '白纸平安，十字撤离；南门外老渡口茶馆，二楼靠窗点龙井接头。', price: 0 },
  { id: 'mem_baban_code', name: '记忆档案·八办接头暗号', description: '“请问这里有《群众》周刊吗？”——“你要哪一期的？”——“创刊号那期。”', price: 0 },
  { id: 'item_baban_route', name: '八办路线纸条', description: '途经武汉时，前往八路军办事处找蒋南翔的路线（汉口旧日租界 89 号）。', price: 0 },
  { id: 'item_backup_teahouse', name: '【状态】听雨轩备用联络点', description: '长沙第二处可用联络点，已激活（在南门老渡口茶馆之外）。', price: 0 },
  { id: 'item_idle_piece', name: '【状态】闲棋冷子', description: '与组织关系为隐蔽待命：不去延安，以普通学生身份混入服务团。', price: 0 },
  // ========== 剧情道具（有图片） ==========
  { id: 'silver', name: '银两', description: '旅途中可使用的硬通货。', detail: '民国年间流通的袁大头，在战乱年代比纸币更易被接受。', image: '/assets/prop/silver.png', emoji: '🪙', price: 0 },
  { id: 'dryfood', name: '干粮', description: '一次远行所需的干粮。', detail: '粗面饼干与腌萝卜干，携带方便，可维持数日。', image: '/assets/prop/ganliang.png', price: 0 },
  { id: 'item_medicine_gold', name: '金疮药', description: '止血疗伤的外敷良药。', detail: '传统中药膏，对外伤出血有立竿见影的效果。', image: '/assets/prop/jinchuangyao.png', price: 0 },
  { id: 'item_medicine_quinine', name: '奎宁药片', description: '治疗疟疾和水土不服。', detail: '热带地区的救命药，副作用是耳鸣，但能对抗疟疾。', image: '/assets/prop/kuiningyaopian.png', price: 0 },
  { id: 'item_mother_bag', name: '慈母锦囊', description: '母亲亲手缝制的布袋，内装生活用品。', detail: '临行前母亲偷偷塞给你的，针脚细密，带着家的温度。', image: '/assets/prop/cimujingnang.png', price: 0 },
  { id: 'item_talisman', name: '平安符', description: '一道朱砂画就的平安符。', detail: '据说由北平白云观道士开光，可保路途平安。', image: '/assets/prop/pinganfu.png', price: 0 },
  { id: 'item_safe_pouch', name: '安全囊', description: '隐蔽贴身的小布袋。', detail: '可藏密信或少量银元，缝在内衣里不易被搜出。', image: '/assets/prop/bunang.png', price: 0 },
  { id: 'item_court_letter', name: '介绍信', description: '前往西南联大的官方通行证。', detail: '有校方印章和教务长签名，沿途关卡见之放行。', image: '/assets/prop/jieshaoxin.png', price: 0 },
  { id: 'item_father_safe_letter', name: '父亲平安信', description: '父亲从北平托人捎来的平安家书。', detail: '信中只写"父安，勿念"四字，信纸里夹着一片海棠花瓣。', image: '/assets/prop/pinganxin.png', price: 0 },
  { id: 'item_classmate_letter', name: '无名同学来信', description: '指向长沙临时大学的匿名来信。', detail: '信中夹带一片梧桐叶，暗示接应地点在岳麓山下的梧桐小径。', image: '/assets/prop/wumingtongxuelaixin.png', price: 0 },
  { id: 'wuchang_contact_note', name: '武昌联络字条', description: '指向武昌联络点的紧急纸条。', detail: '纸条上用暗写墨水标记了联络点的街道与门牌号，仅在紫外灯下显现。', image: '/assets/prop/wuchanglianluozhitiao.png', price: 0 },
  // ========== 剧情道具（无图片，用 emoji） ==========
  { id: 'item_wang_address', name: '王先生住址', description: '清华园附近的一处秘密联络地址。', emoji: '📇', price: 0 },
  { id: 'service_badge', name: '服务团徽章', description: '长沙临时大学服务团的官方徽章。', emoji: '🎖️', price: 0 },
  { id: 'tag_burned_book', name: '【状态】已焚毁禁书', description: '你选择了销毁那本危险的进步书籍。', emoji: '🔥', price: 0 },
  { id: 'tag_gave_book', name: '【状态】已转交禁书', description: '你把那本书交给了更安全的人保管。', emoji: '📤', price: 0 },
  { id: 'tag_rewrapped_book', name: '【状态】已重新包装禁书', description: '你用普通杂志包裹住了那本书，暂时安全。', emoji: '📦', price: 0 },
  { id: 'tag_tracked', name: '【状态】被人跟踪', description: '近期有不明身份的人在跟踪你。', emoji: '👁️', price: 0 },
  // ========== 可兑换商品 ==========
  { id: 'p_smoking_pipe', name: '烟斗', description: '民国时期常见的吸烟器具，木质与铜制结合。', detail: '无', image: '/assets/goods/yandou.png', price: 8 },
  { id: 'p_black_cloth_shoes', name: '黑色布鞋', description: '传统手工制作的布鞋，隐蔽性好。', detail: '无', image: '/assets/goods/heisebuxie.png', price: 12 },
  { id: 'p_scarf', name: '围巾', description: '冬日里御寒的必需品，也是伪装工具。', detail: '无', image: '/assets/goods/weijin.png', price: 10 },
  { id: 'p_pocket_watch', name: '怀表', description: '精准计时的老式怀表，掌握每一次接头时刻。', detail: '无', image: '/assets/goods/huaibiao.png', price: 14 },
  { id: 'p_red_star_cap', name: '红星军帽', description: '象征着信仰的红星军帽，佩戴者身份特殊。', detail: '无', image: '/assets/goods/hongxingjunmao.png', price: 16 },
  { id: 'p_canteen', name: '水壶', description: '普通民用水壶，日常出行必备。', detail: '无', image: '/assets/goods/shuihu.png', price: 9 },
  { id: 'p_thermos', name: '暖水壶', description: '能保温数小时的暖水壶，长途跋涉的好伙伴。', detail: '无', image: '/assets/goods/nuanshuihu.png', price: 11 },
  { id: 'p_matches', name: '火柴', description: '小小一根火柴，点燃夜色中的希望。', detail: '无', image: '/assets/goods/huochai.png', price: 4 },
  { id: 'p_enamel_cup', name: '搪瓷杯子', description: '搪瓷材质的口杯，轻便耐用。', detail: '无', image: '/assets/goods/beizi.png', price: 7 },
  { id: 'p_iron_box', name: '铁制收纳盒', description: '坚硬的铁盒，可存放秘密文件或密信。', detail: '无', image: '/assets/goods/tiezhishounahe.png', price: 13 },
  { id: 'p_kerosene_lamp', name: '煤油马灯', description: '风雨中的光明指引，不易被风吹灭。', detail: '无', image: '/assets/goods/meiyoumadeng.png', price: 12 },
  { id: 'p_cigarette', name: '中华香烟', description: '社交场合的硬通货，也可作为暗号道具。', detail: '无', image: '/assets/goods/zhonghuaxiangyan.png', price: 6 },
  { id: 'p_xinhua_daily', name: '新华日报', description: '在国统区秘密传播的红色报纸。', detail: '无', image: '/assets/goods/baozhi.png', price: 5 },
  { id: 'p_old_photo', name: '老照片', description: '可能暗藏秘密的珍贵影像。', detail: '无', image: '/assets/goods/zhaopian.png', price: 7 },
  { id: 'p_letter', name: '信件', description: '通过秘密渠道传递的重要信件。', detail: '无', image: '/assets/goods/xinjian.png', price: 6 },
  { id: 'p_diary', name: '日记本', description: '记录秘密行动的笔记本，需小心保管。', detail: '无', image: '/assets/goods/riji.png', price: 9 },
  { id: 'p_dagger', name: '匕首', description: '近身防身利器，小巧易隐藏。', detail: '无', image: '/assets/goods/bishou.png', price: 15 },
  { id: 'p_rifle', name: '步枪', description: '制式步枪，火力强大。', detail: '无', image: '/assets/goods/buqiang.png', price: 19 },
  { id: 'p_ammo_box', name: '子弹盒', description: '随身携带的弹药补给。', detail: '无', image: '/assets/goods/zidan.png', price: 10 },
  { id: 'p_helmet', name: '军用头盔', description: '保护头部免受弹片伤害。', detail: '无', image: '/assets/goods/junyongtoukui.png', price: 17 },
  { id: 'p_backpack', name: '背包', description: '大容量军用背包，可携带大量物资。', detail: '无', image: '/assets/goods/beibao.png', price: 14 },
  { id: 'p_compass', name: '指南针', description: '战乱中不迷路的重要工具。', detail: '无', image: '/assets/goods/zhinanzhen.png', price: 13 },
  { id: 'p_military_canteen', name: '军用水壶', description: '制式军用水壶，密封性好、容量大。', detail: '无', image: '/assets/goods/junyongshuihu.png', price: 11 },
  { id: 'p_map', name: '地图', description: '公开出版的标准地图。', detail: '无', image: '/assets/goods/ditu.png', price: 12 },
  { id: 'p_binoculars', name: '望远镜', description: '远距离侦察敌情的必备装备。', detail: '无', image: '/assets/goods/wangyuanjing.png', price: 16 },
  { id: 'p_iodine', name: '碘酒', description: '简易伤口消毒药水。', detail: '无', image: '/assets/goods/dianjiu.png', price: 8 },
  { id: 'p_medical_kit', name: '医疗包', description: '战地急救包，可处理常见伤势。', detail: '无', image: '/assets/goods/yiliaobao.png', price: 15 },
  { id: 'p_medical_crate', name: '医疗箱', description: '完整的医疗工具箱，药品器械齐全。', detail: '无', image: '/assets/goods/yiliaoxiang.png', price: 18 },
]

export const characterCards: CharacterCard[] = [
  { id: 'jiang_nanxiang', name: '蒋南翔', role: '党组织联络人', age: '青年', origin: '北平', identity: '我方潜伏人员', summary: '负责与你建立单线联系并交代离校任务。', clues: ['严格执行单线联系', '强调纪律与保密', '以地下身份开展工作'] },
  { id: 'zhang_shoutian', name: '张守田', role: '清华校园门卫', age: '34 岁', origin: '河北新城', identity: '平民', summary: '籍贯、口音、履历和手部特征完全一致，只为养家糊口。', clues: ['口音与籍贯匹配', '多年务农形成厚茧', '不主动打探学生动向'] },
  { id: 'su_wenbin', name: '苏文彬', role: '清华校园便衣', age: '29 岁', origin: '北平', identity: '我方潜伏人员', summary: '潜伏在校园特务队伍中收集抓捕行动情报。', clues: ['紧张时流露福建口音', '虎口有握枪硬茧', '行动与立场存在可解释疑点'] },
  { id: 'zhang_huiru', name: '张慧茹', role: '清华进步学生', age: '20 岁', origin: '广东韶关', identity: '国民党特务', summary: '以进步学生为伪装，记录学生交往和书刊流向。', clues: ['籍贯口音矛盾', '指尖有密写印泥痕迹', '私下记录学生名单'] },
  { id: 'li_wanqing', name: '李婉清', role: '清华在校学生', age: '19 岁', origin: '江苏苏州', identity: '平民', summary: '专心课业的普通学生，没有特殊任务。', clues: ['苏州口音与籍贯匹配', '只有读写形成的薄茧', '不监视、不试探他人'] },
  { id: 'wu_cuilian', name: '吴翠莲', role: '清华宿舍保洁女工', age: '43 岁', origin: '河北农村', identity: '国民党特务', summary: '利用自由进出宿舍的便利截取书信和进步书刊。', clues: ['情急时流露四川方言', '声称不识字却收集纸条', '指尖残留密写药水'] },
  { id: 'chen_xiuzhen', name: '陈秀珍', role: '逃难带娃的妇人', age: '34 岁', origin: '河南周口', identity: '我方潜伏人员', summary: '借逃难身份传递情报、观察沿途哨卡。', clues: ['口音偶有江南腔', '指尖有药水残留', '频繁打探交通和盘查规则'] },
]

// 身份鉴别案例：free=true 的前 3 个案例线索直接给出无需付费；free=false 的案例每条线索需羽毛解锁
export interface IdentityCase {
  id: string; name: string; title: string; free: boolean; price?: number
  answer: string; explanation: string
  clues: { id: string; label: string; content: string }[]
}

export const identityCases: IdentityCase[] = [
  // ========== 前 3 个：免费直出 ==========
  {
    id: 'zhang_shoutian', name: '张守田', title: '门卫身份档案', free: true,
    answer: '平民',
    explanation: '籍贯、经历、身体痕迹、言谈思想全部统一，无任何政治背景与特殊使命，是依靠体力工作维持家用的普通底层百姓。',
    clues: [
      { id: 'identity:zhang_shoutian:origin',  label: '籍贯与口音', content: '籍贯河北新城，日常全程使用地道的新城乡土口音，无外来方言或刻意改口音的矛盾。' },
      { id: 'identity:zhang_shoutian:work',    label: '履历与手部特征', content: '务农二十三年、入校当门卫三年，长期干体力活，双手布满厚茧，无枪械、密写等特殊痕迹。' },
      { id: 'identity:zhang_shoutian:conduct', label: '日常言行', content: '从不主动打探学生动向，不搜查书籍信件，只关心温饱生计，无监视、试探等异常行为。' },
    ],
  },
  {
    id: 'su_wenbin', name: '苏文彬', title: '便衣身份档案', free: true,
    answer: '我方潜伏人员',
    explanation: '主动打入国民党校园特务队伍收集情报。三处疑点虽有破绽，但均可依靠伪装身份编造说辞化解，无国民党特务那种多处无法解释的硬伤，且区别于毫无疑点的平民。',
    clues: [
      { id: 'identity:su_wenbin:origin',  label: '籍贯与口音疑点', content: '对外称自幼生长北平从没去过南方，但情绪慌乱时会不自觉冒出福建方言，说辞勉强。' },
      { id: 'identity:su_wenbin:hand',    label: '手部痕迹疑点', content: '对外登记只跟踪学生行踪无需配枪，但其虎口有长期握持短枪形成的厚茧，与宣传工作冲突。' },
      { id: 'identity:su_wenbin:conduct', label: '立场言论疑点', content: '在军官、校方面前积极搜查进步书刊、检举学生，完全贴合国民党管控要求。' },
    ],
  },
  {
    id: 'zhang_huiru', name: '张慧茹', title: '进步学生身份档案', free: true,
    answer: '国民党特务',
    explanation: '伪装成追求救国理想的广东进步学生，实际是安插在清华校内的国民党特务。三处核心信息互相冲突，伪装目的性极强，核心任务为监视、搜集进步学生情报。',
    clues: [
      { id: 'identity:zhang_huiru:origin', label: '籍贯口音矛盾', content: '自述籍贯广东韶关，激动时脱口而出地道北平口语，只能含糊搪塞年少在北平寄养，说辞生硬。' },
      { id: 'identity:zhang_huiru:hand',   label: '手部痕迹矛盾', content: '对外称只写读书笔记，正常学生只有握笔薄茧，但指尖残留专用密写印泥痕迹，无法合理辩解。' },
      { id: 'identity:zhang_huiru:conduct',label: '言行目的矛盾', content: '表面和进步学生交好、借阅红色书籍，私下记录学生交友与深夜外出名单，说辞无法掩盖反常举动。' },
    ],
  },
  // ========== 后 4 个：需羽毛解锁 ==========
  {
    id: 'li_wanqing', name: '李婉清', title: '在校学生身份档案', free: false, price: 8,
    answer: '平民',
    explanation: '履历、身体特征、言谈举止完全统一，不存在特务、地下潜伏人员的伪装破绽。只是专心读书、心思单纯的普通学生。',
    clues: [
      { id: 'identity:li_wanqing:origin',  label: '籍贯与口音', content: '籍贯苏州，日常说话一直是普通话夹带苏州软音，无刻意改口音或漏外地腔调。' },
      { id: 'identity:li_wanqing:hand',    label: '手部痕迹', content: '平日只读书写字，仅有笔尖磨出的薄茧，无枪械、密写、外勤劳作等特殊痕迹。' },
      { id: 'identity:li_wanqing:conduct', label: '言行表现', content: '只关心学业与家乡琐事，谈论时局仅抒发学生朴素忧国情绪，不私下盯人或记录他人行踪。' },
    ],
  },
  {
    id: 'wu_cuilian', name: '吴翠莲', title: '宿舍保洁身份档案', free: false, price: 8,
    answer: '国民党特务',
    explanation: '以宿舍保洁校工为掩护，利用自由进出宿舍的便利搜查进步书刊、截取书信、记录进步学生动向。三处核心破绽无法合理掩盖，与平民、我方潜伏人员有明显区分。',
    clues: [
      { id: 'identity:wu_cuilian:origin', label: '籍贯口音疑点', content: '对外称土生土长河北乡下妇女，情急时常不受控制冒出四川方言，远亲寄养的说辞逻辑生硬。' },
      { id: 'identity:wu_cuilian:hand',   label: '识字行为与口述矛盾', content: '反复对外说一字不识，可打扫时专门翻看学生书本、拆开丢弃信件、悄悄收好纸条留存，与自述严重冲突。' },
      { id: 'identity:wu_cuilian:conduct',label: '手部痕迹疑点', content: '本职仅扫地洗衣，本应只有做家务的薄茧，但指尖长期残留密写药水痕迹，保洁女工无合理接触理由。' },
    ],
  },
  {
    id: 'chen_xiuzhen', name: '陈秀珍', title: '逃难妇人身份档案', free: false, price: 8,
    answer: '我方潜伏人员',
    explanation: '真实身份为地下党潜伏交通员，利用妇女、孩童的弱势外表降低防备，借逃难掩护传递情报。三处疑点虽有破绽，但都能依靠逃难妇人的伪装临时圆场，没有国民党特务那种逻辑完全崩塌的硬漏洞。',
    clues: [
      { id: 'identity:chen_xiuzhen:origin', label: '籍贯口音矛盾', content: '自述土生土长河南周口人，放松警惕时会下意识说出江南口音，只能牵强说年少随亲戚暂住江南。' },
      { id: 'identity:chen_xiuzhen:hand',   label: '手部痕迹矛盾', content: '对外身份是普通农村妇女，手上仅有家务薄茧，但指尖留存密写药水印记，无合理缘由。' },
      { id: 'identity:chen_xiuzhen:conduct',label: '行为目的矛盾', content: '嘴上说只想安稳赶路躲避战乱，却频繁打探学生去向、军警盘查规则、南下交通路线，频率远超普通逃难百姓。' },
    ],
  },
  {
    id: 'gu_yongchang', name: '顾永昌', title: '杂货商人身份档案', free: false, price: 8,
    answer: '国民党特务',
    explanation: '以南北杂货商人为掩护身份，真实是国民党外勤特务，借经商流动便利在车站市井监视搜集爱国学生与地下活动线索。三处难以圆谎的核心漏洞，和无异常平民、仅有少量可解释疑点的我方潜伏人员有明显区分。',
    clues: [
      { id: 'identity:gu_yongchang:origin', label: '籍贯口音矛盾', content: '自述从小在安徽阜阳长大，情绪慌乱时会脱口说出江浙方言，说辞前后矛盾。' },
      { id: 'identity:gu_yongchang:hand',   label: '手部痕迹矛盾', content: '杂货商人日常只记账理货，应有笔尖薄茧，但其虎口有长期握持短枪的厚重硬茧，难以托词掩盖。' },
      { id: 'identity:gu_yongchang:conduct',label: '行为动机矛盾', content: '极少谈论商品价格货源，反而主动打听流亡学生去向、军警哨卡布防，打探情报目的性极强。' },
    ],
  },
]

export const quizBank: Quiz[] = [
  { id:'q1', sourceType:'knowledge', type:'single', question:'国家秘密载体应当如何管理？', options:['随身公开携带','严格保密并按规定流转','拍照上传网络','交给陌生人保管'], answer:'严格保密并按规定流转', explanation:'国家秘密载体必须依法依规管理。', rewards:{feathers:3} },
  { id:'q2', sourceType:'knowledge', type:'single', question:'发现危害国家安全的可疑线索，正确做法是？', options:['自行调查并传播','依法向有关机关举报','置之不理','发布到社交平台'], answer:'依法向有关机关举报', explanation:'应通过合法渠道报告线索。', rewards:{feathers:3} },
  { id:'q3', sourceType:'knowledge', type:'single', question:'以下哪项属于保密纪律？', options:['不在公共场所谈论秘密','把密码写在明处','借用他人账号传递文件','使用未授权设备存储'], answer:'不在公共场所谈论秘密', explanation:'保密工作首先要避免无关人员接触秘密。', rewards:{feathers:4} },
]

export const morseChallenges: MorseChallenge[] = [
  { id:'morse_sos', level:'初级', text:'SOS', answer:'... --- ...', seconds:15, reward:4 },
  { id:'morse_hq', level:'初级', text:'HQ', answer:'.... --.-', seconds:15, reward:4 },
  { id:'morse_ck', level:'初级', text:'CK', answer:'-.-. -.-', seconds:15, reward:4 },
  { id:'morse_v', level:'初级', text:'V', answer:'...-', seconds:15, reward:4 },
  { id:'morse_rt', level:'中级', text:'RT', answer:'.-. -', seconds:20, reward:6 },
  { id:'morse_x', level:'中级', text:'X', answer:'-..-', seconds:20, reward:6 },
  { id:'morse_kc', level:'中级', text:'KC', answer:'-.- -.-.', seconds:20, reward:6 },
  { id:'morse_73', level:'中级', text:'73', answer:'--... ...--', seconds:20, reward:6 },
  { id:'morse_wait', level:'高级', text:'WAIT', answer:'.-- .- .. -', seconds:30, reward:10 },
  { id:'morse_copy', level:'高级', text:'COPY', answer:'-.-. --- .--. -.--', seconds:30, reward:10 },
  { id:'morse_sh', level:'高级', text:'SH', answer:'... ....', seconds:30, reward:10 },
  { id:'morse_abort', level:'高级', text:'ABORT', answer:'.- -... --- .-. -', seconds:30, reward:15 },
]