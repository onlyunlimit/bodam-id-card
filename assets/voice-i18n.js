import { voices } from './voices.js';
import { registerCopy } from './i18n.js';
const translations = {
  ibex: [
    [
      'Position confirmed. Stay outside the cordon. I will handle the rest.',
      'I am on break. If it is urgent, leave your location first.',
    ],
    [
      '位置を確認しました。規制線の外で待機してください。あとは私が対応します。',
      '今は休息時間です。急ぎなら、まず位置を残してください。',
    ],
    ['位置已确认。请在警戒线外待命，其余由我处理。', '现在是休息时间。若有急事，请先留下位置。'],
  ],
  slun: [
    [
      'Ready already? Impatient, aren’t you. I’ll be there. Don’t get hurt before I arrive.',
      'Calling me on my break? Must be urgent. Leave a message. I’m watching.',
    ],
    [
      'もう準備できたの？せっかちだね。すぐ行くから、先に怪我しないでよ。',
      '休んでる人まで呼ぶなんて、急ぎなんだ？用件残して。見てはいるから。',
    ],
    [
      '这就准备好了？真着急啊。我马上到，别先把自己弄伤了。',
      '连休息的人都要找，看来挺急？留言吧，我看着呢。',
    ],
  ],
  jaeshin: [
    [
      'Confirmed. Record any changes and I will review them promptly.',
      'I am away from my desk. I will check the urgent items first.',
    ],
    [
      '確認しました。変更点は記録に残してください。すぐに確認します。',
      'ただいま席を外しています。急ぎのものから確認します。',
    ],
    ['已确认。变动请记录下来，我会立即查看。', '暂时不在。我会优先确认紧急事项。'],
  ],
  bug: [
    [
      '…Logs are up. Stop calling twice. Even the notifications are going to bug out.',
      'Status: sleep mode. Attach logs if it’s urgent. Don’t just wake me up.',
    ],
    [
      '…ログは上げました。重複呼び出しやめて。通知までバグりそう。',
      '状態：省電力。急ぎならログ添付で。ただ起こさないで。',
    ],
    ['……日志传了。别重复呼叫，通知都快出bug了。', '状态：节能。有急事附日志，别光叫醒我。'],
  ],
  binjo: [
    [
      'Send your location. Don’t follow alone. Wait there. I’m coming.',
      'Taking a short break. If you’re hurt, tell me right away. Don’t wait on that.',
    ],
    [
      '位置を送って。一人で追わずに、そこで待ってて。俺が行くよ。',
      '少し休んでる。怪我してるならすぐ言って。それは待たなくていい。',
    ],
    ['发位置给我。别一个人追，留在那儿等，我过去。', '正在休息。受伤了就马上说，这种事别等。'],
  ],
  levit: [
    [
      'There you are, hiding again. Call me when you find them. I’ll open the door.',
      'Looking for me? Leave it if it’s interesting. Boring stuff goes to SEOWON.',
    ],
    [
      'どこ行ったかと思えば、また隠れてる。見つけたら呼んで。扉は俺が開ける。',
      '俺を探してるの？面白い話なら残して。つまらないのはソウォンへ。',
    ],
    [
      '还以为去哪儿了，又躲起来了。找到就叫我，门我来开。',
      '找我？有意思的事就留着，无聊的交给SEOWON。',
    ],
  ],
  shepherd: [
    [
      'Coordinates first. I’ll do the paperwork. Just keep the scene secure.',
      'I’m off duty, you know? …Keep it short if it’s urgent. Haven’t put my gear away yet.',
    ],
    [
      '座標を先に送れ。報告書は俺が書くから、現場をちゃんと守れ。',
      'もう退勤したんだけど？…急ぎなら短く残せ。まだ装備は外してないから。',
    ],
    ['先发坐标。报告我写，你把现场守好。', '我已经下班了，知道吧？……急事就简短留言，装备还没卸。'],
  ],
  seowon: [
    [
      'Hello, SEOWON from BEACON. Please check the paperwork once before contact. Thank you.',
      'Hello. Office hours have ended, so replies may take a little longer. Please leave a message and I’ll get back to you.',
    ],
    [
      'はい、ビコンのソウォンです。接触前に書類を一度ご確認いただけますか。ありがとうございます。',
      'こんにちは。本日の業務は終了しており、お返事が遅れる場合がございます。ご用件を残していただければ、確認後にご連絡します。',
    ],
    [
      '您好，我是BEACON的SEOWON。接触前麻烦再核对一下文件，谢谢您。',
      '您好，目前已结束工作，回复可能有所延迟。请留下事项，确认后会与您联系。',
    ],
  ],
  yeomyeong: [
    [
      'Assignment confirmed. Leave any field updates in this channel.',
      'Away at the moment. I will check messages when I return.',
    ],
    [
      '配置を確認しました。現場の変更はこちらに残してください。',
      '不在中です。連絡事項は戻り次第確認します。',
    ],
    ['已确认分配内容，现场有变动请在此频道留言。', '暂时不在，返回后会确认留言。'],
  ],
  wonhyeol: [
    [
      'Hold the line. Move the protected subjects first. I’ll handle the rest.',
      'Rest. If the alarm goes off, I go out first.',
    ],
    [
      '規制線を維持。保護対象から移動させる。残りは俺がやる。',
      '休め。警報が鳴ったら俺が先に出る。',
    ],
    ['维持警戒线，先转移保护对象。其余交给我。', '休息。警报响了，我先出去。'],
  ],
  dain: [
    [
      'Don’t push yourself. Tell me if anything hurts. I’ll be waiting.',
      'I’m resting for a moment. If you’re hurting or anxious, please call. It’s all right.',
    ],
    [
      '無理しないでくださいね。つらいところがあれば先に教えてください。待っています。',
      '少し休んでいます。痛かったり不安だったりしたら、必ず呼んでくださいね。大丈夫です。',
    ],
    [
      '别勉强自己。不舒服的话先告诉我，我会等着。',
      '正在稍作休息。疼痛或不安时一定要叫我，没关系的。',
    ],
  ],
  jion: [
    [
      'Ready. Try to keep up. …You checked the safety locks, right?',
      'I’m resting. DAIN’s in the next channel. Leave the urgent stuff with me.',
    ],
    [
      '準備できた。遅れるなよ。…安全装置は確認したよな？',
      '俺は休む。デインなら隣のチャンネル。急ぎの用は俺に残せ。',
    ],
    ['准备好了，别落后。……安全装置检查了吧？', '我要休息。找DAIN去旁边频道，急事留给我。'],
  ],
  sando: [
    [
      'Confirmed. I’ll take the front. You cover the rear.',
      'Stepping away. I’ll check when I’m back.',
    ],
    ['確認。前は俺が見る。後ろは頼む。', '少し外す。戻ったら確認する。'],
    ['收到。前面我看着，后面拜托了。', '离开一下，回来确认。'],
  ],
  baekjin: [
    [
      'Nothing unusual. I’ll organize the records and upload them.',
      'Today’s records are closed. Please leave any additions here.',
    ],
    [
      '異常ありません。記録は整理して上げておきます。',
      '本日の記録は締めました。追加があれば残してください。',
    ],
    ['没有异常，整理好记录就上传。', '今日记录已归档，有补充请留言。'],
  ],
  jaein: [
    [
      'Everyone ready? No loose ends today. One more final check!',
      'That’s a wrap! I’m reading all your messages. I’ll give you another great day tomorrow.',
    ],
    [
      'みんな準備できた？今日も隙なくいこう。最後にもう一回チェック！',
      '今日の予定は終了！応援は全部読んでるよ。明日もかっこいい姿で会おうね。',
    ],
    [
      '大家准备好了吗？今天也要毫无破绽，再做一次最终检查！',
      '今天行程结束！应援都在看，明天也会以帅气的样子见面。',
    ],
  ],
  danjo: [
    [
      'Got it. If we’re ready, let’s go. I don’t like being late.',
      'Resting. Saw your message. I’ll reply in a bit.',
    ],
    [
      '確認した。準備できたら行こう。遅れるのは好きじゃない。',
      '休んでる。メッセージは見た。返事はもう少しあとで。',
    ],
    ['确认了。准备好就走，不喜欢迟到。', '休息中，消息看到了，晚点回。'],
  ],
  unsae: [
    [
      'Schedule confirmed. I’ll check the equipment first.',
      'Today’s schedule is finished. Thank you for the support. I made it back safely.',
    ],
    [
      '予定を確認しました。先に装備を見てきます。',
      '今日の予定は終わりました。応援ありがとうございます。無事に戻りました。',
    ],
    ['已确认日程，我先去检查装备。', '今天行程结束了。谢谢应援，我平安回来了。'],
  ],
  yujin: [
    [
      'Ready. If it’s a message for my brother, please use his channel.',
      'That’s all for today. Get some rest, everyone. I’m going to enjoy some quiet.',
    ],
    [
      '準備できました。兄への伝言は本人のチャンネルへお願いします。',
      '今日はここまで。みんなゆっくり休んでね。私は少し静かに過ごします。',
    ],
    ['准备好了。给哥哥的传话请去他本人的频道。', '今天到这里，大家好好休息。我也要安静一会儿了。'],
  ],
  chabin: [
    [
      'Check your gear. We’re deploying. Everyone comes back together.',
      'We’re back. Rest today. Take care of yourselves before the next assignment.',
    ],
    [
      '装備確認。出動する。帰る時も全員一緒だ。',
      '帰還した。今日は休め。次の予定までに体を整えておけ。',
    ],
    ['检查装备，出动。回来时也必须全员一起。', '已归队。今天休息，下次行程前先照顾好身体。'],
  ],
  hanho: [
    [
      'Got the update. I’ll check again so nothing slips through.',
      'Taking a break. Leave a message. I’ll read it when I’m back.',
    ],
    [
      '連絡は確認したよ。見落としがないよう、もう一度見ておくね。',
      '今は休憩中。メッセージを残して。戻ったら見るよ。',
    ],
    ['消息确认了，我再看一遍，免得遗漏。', '现在休息，留言就好，回来会看。'],
  ],
  mohyun: [
    [
      'Briefing is ready. I’ll upload the materials first.',
      'Thank you for your work today. I’ll pick up the remaining messages tomorrow.',
    ],
    [
      'ブリーフィングの準備ができました。資料は先に上げておきます。',
      '今日もお疲れさまでした。残りの連絡は明日続けて確認します。',
    ],
    ['简报准备好了，所需资料先上传。', '今天也辛苦了，剩余消息明天继续确认。'],
  ],
  yuhwan: [
    [
      'Checks done. Here’s to another good day. Let’s talk when we’re back safe.',
      'Done for today! Looking for YUJIN? LUCKY TRICK channel. Don’t mix us up!',
    ],
    [
      'チェック完了。今日もよろしく。無事に帰ってから話そう。',
      '今日は終了！ユジンならLUCKY TRICKのチャンネルだよ。間違えないでね。',
    ],
    [
      '检查完毕，今天也请多关照。平安回来再聊。',
      '今天结束！找YUJIN要去LUCKY TRICK频道，别弄错啦。',
    ],
  ],
  az: [
    ['…Hear me?', 'Away. Don’t look.'],
    ['…聞こえる？', '不在。探すな。'],
    ['……听得见？', '不在。别找。'],
  ],
};
export function installVoiceTranslations() {
  Object.entries(voices).forEach(([id, lines]) =>
    lines.forEach((line, i) => registerCopy(line, ...translations[id].map((a) => a[i]))),
  );
}
