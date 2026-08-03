import { KpssCountdownBanner } from "@/components/KpssCountdownBanner.js";
import { KpssAutoPlannerCard } from "@/components/kpss/planner/KpssAutoPlannerCard.js";
import { KpssDailyStatsCard } from "@/components/kpss/daily/KpssDailyStatsCard.js";
import { KpssNetEstimationCard } from "@/components/kpss/topics/KpssNetEstimationCard.js";
import { KpssTopicList } from "@/components/kpss/topics/KpssTopicList.js";
import { Language, KpssDailyStats } from "@/types/types.js";
import type { KpssProgress } from "@/domain/services/KpssCalculatorService.js";
import type { KpssTopic } from "@/services/kpss/kpssService.js";

interface KpssProgressSectionProps {
  lang: Language;
  t: Record<string, string>;
  labels: Record<string, string>;
  kpssTimeLeft: string;
  estimatedTimeLeft: string;
  remainingCount: number;
  kpssProgress: KpssProgress[];
  dailyStats: KpssDailyStats[];
  questionsInput: string;
  videosInput: string;
  subjectInput: string;
  chartDays: 7 | 30;
  chartType: "line" | "bar";
  sortBy: "default" | "questions" | "status";
  goalType: "net" | "score";
  targetNet: number;
  targetScore: number;
  currentSubject: string;
  subjectsList: string[];
  kpssTargetDate: number;
  overallNet: number;
  maxNet: number;
  estimatedScore: number;
  getSubjectNets: (subKey: string) => { net: number; max: number };
  topics: KpssTopic[];
  onQuestionsInputChange: (v: string) => void;
  onVideosInputChange: (v: string) => void;
  onSubjectInputChange: (v: string) => void;
  onSaveStats: () => void;
  onResetStats: () => void;
  onDeleteStat: (date: string) => void;
  onChartDaysChange: (days: 7 | 30) => void;
  onChartTypeChange: (type: "line" | "bar") => void;
  onSelectSubject: (subKey: string) => void;
  onSortByChange: (val: "default" | "questions" | "status") => void;
  onStartQuiz: (topic: string, subject?: string) => void;
  onShowDetail: (topic: { title: string; description: string }) => void;
  onOpenYoutube: (topic: string) => void;
}

export function KpssProgressSection({
  lang,
  t,
  labels,
  kpssTimeLeft,
  estimatedTimeLeft,
  remainingCount,
  kpssProgress,
  dailyStats,
  questionsInput,
  videosInput,
  subjectInput,
  chartDays,
  chartType,
  sortBy,
  goalType,
  targetNet,
  targetScore,
  currentSubject,
  subjectsList,
  kpssTargetDate,
  overallNet,
  maxNet,
  estimatedScore,
  getSubjectNets,
  topics,
  onQuestionsInputChange,
  onVideosInputChange,
  onSubjectInputChange,
  onSaveStats,
  onResetStats,
  onDeleteStat,
  onChartDaysChange,
  onChartTypeChange,
  onSelectSubject,
  onSortByChange,
  onStartQuiz,
  onShowDetail,
  onOpenYoutube,
}: KpssProgressSectionProps) {
  return (
    <>
      <KpssCountdownBanner
        lang={lang}
        t={t}
        kpssTimeLeft={kpssTimeLeft}
        estimatedTimeLeft={estimatedTimeLeft}
        remainingCount={remainingCount}
      />

      <KpssAutoPlannerCard
        t={t}
        kpssProgress={kpssProgress}
        onStartQuiz={(subject, topicTitle) => onStartQuiz(topicTitle, subject)}
        labels={labels}
      />

      <KpssDailyStatsCard
        lang={lang}
        t={t}
        questionsInput={questionsInput}
        videosInput={videosInput}
        subjectInput={subjectInput}
        chartDays={chartDays}
        chartType={chartType}
        onQuestionsInputChange={onQuestionsInputChange}
        onVideosInputChange={onVideosInputChange}
        onSubjectInputChange={onSubjectInputChange}
        onSaveStats={onSaveStats}
        onResetStats={onResetStats}
        onDeleteStat={onDeleteStat}
        onChartDaysChange={onChartDaysChange}
        onChartTypeChange={onChartTypeChange}
        labels={labels}
        subjectsList={subjectsList}
        dailyStats={dailyStats}
        goalType={goalType}
        targetNet={targetNet}
        targetScore={targetScore}
        kpssProgress={kpssProgress}
        kpssTargetDate={kpssTargetDate}
      />

      <KpssNetEstimationCard
        t={t}
        goalType={goalType}
        targetNet={targetNet}
        targetScore={targetScore}
        overallNet={overallNet}
        maxNet={maxNet}
        estimatedScore={estimatedScore}
        getSubjectNets={getSubjectNets}
        labels={labels}
        subjectsList={subjectsList}
        selectedSubject={currentSubject}
        onSelectSubject={onSelectSubject}
      />

      <KpssTopicList
        lang={lang}
        t={t}
        topics={topics}
        kpssProgress={kpssProgress}
        currentSubject={currentSubject}
        sortBy={sortBy}
        onSortByChange={onSortByChange}
        onStartQuiz={(topic) => onStartQuiz(topic)}
        onShowDetail={onShowDetail}
        onOpenYoutube={onOpenYoutube}
      />
    </>
  );
}
