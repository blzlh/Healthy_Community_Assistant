/**
 * 健康分析 - 温馨提示组件
 */


export function HealthTips() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="text-amber-400">|</div>
        <div>
          <h4 className="font-medium text-amber-400 mb-1">温馨提示</h4>
          <ul className="text-sm text-amber-400/70 space-y-1">
            <li>• AI 分析结果仅供参考，不能替代专业医疗诊断</li>
            <li>• 如有身体不适，请及时前往医院就诊</li>
            <li>• 本服务不提供药物推荐和处方建议</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
