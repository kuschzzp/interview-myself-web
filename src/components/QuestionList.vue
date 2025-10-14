<template>
	<section class="card">
		<h2>5. 问题列表 · 回答并分析</h2>
    <el-empty v-if="questions.length === 0" description="请先生成问题" />
    <el-collapse v-else v-model="active" accordion>
            <el-collapse-item class="q-item" v-for="(q, idx) in questions" :key="q.id" :name="q.id">
                    <template #title>
                            <div class="title">
                                    <span class="index">{{ idx + 1 }}.</span>
                                    <span class="title-text">{{ truncate(q.text, 40) }}</span>
                                    <div class="status">
                                            <el-tag size="small" type="success" effect="light" round v-if="hasAnswer(q)">已回答</el-tag>
                                            <el-tag size="small" type="info" effect="light" round v-else>未回答</el-tag>
                                    </div>
                            </div>
                    </template>

                    <div class="full-question">
                            <span class="label">问题</span>
                            <div class="fq-text">{{ q.text }}</div>
                    </div>

                    <div class="inner">
                            <el-input
                                    type="textarea"
                                    :autosize="{ minRows: 5, maxRows: 12 }"
                                    v-model="answers[q.id]"
                                    placeholder="请输入你的回答"
                            />

                            <div class="actions">
                                    <el-button type="primary" @click="analyze(q)" :loading="isAnalyzing(q.id)" :disabled="isAnalyzing(q.id)">分析答案</el-button>
                            </div>
                    </div>

                    <div v-if="q.analysis || q.standardAnswer" class="analysis">
                            <template v-if="q.analysis">
                                    <div class="section-title">分析</div>
                                    <div class="md" v-html="renderMd(q.analysis)"></div>
                            </template>
                            <template v-if="q.standardAnswer">
                                    <div class="section-title">参考答案</div>
                                    <div class="md" v-html="renderMd(q.standardAnswer)"></div>
                            </template>
                    </div>
            </el-collapse-item>
    </el-collapse>
	</section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

type Question = { id: string; text: string; answer?: string; analysis?: string; standardAnswer?: string };
const props = defineProps<{ questions: Question[]; analyzingIds?: string[] }>();
const emit = defineEmits<{ (e: 'analyze', payload: { id: string; answer: string }): void }>();

const answers = reactive<Record<string, string>>({});
const active = ref<string | undefined>(undefined);

watch(
	() => props.questions,
	(list) => {
		for (const q of list) {
			answers[q.id] = q.answer || '';
		}
	},
	{ immediate: true }
);

function analyze(q: Question) {
    emit('analyze', { id: q.id, answer: answers[q.id] || '' });
}

function isAnalyzing(id: string): boolean {
    return (props.analyzingIds || []).includes(id);
}

import { marked } from 'marked';
function renderMd(src?: string) {
    return marked.parse(src || '');
}

function hasAnswer(q: Question): boolean {
    const val = answers[q.id] ?? q.answer ?? '';
    return !!String(val).trim();
}

function truncate(text: string, max = 40): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
}
</script>

<style scoped>
.card {
	border: 1px solid #eee;
	border-radius: 8px;
	padding: 16px;
	background: #fff;
}
.title { display: flex; align-items: center; width: 100%; gap: 8px; }
.title .index { color: #909399; width: 24px; text-align: right; }
.title .title-text { flex: 1; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.title .status { margin-left: auto; display: flex; align-items: center; }
.ml8 { margin-left: 8px; }
.analysis { margin-top: 8px; background: #f7fafc; border: 1px solid #e6edf5; border-radius: 6px; padding: 8px; }
.pre { margin: 4px 0 0; white-space: pre-wrap; }
.placeholder { color: #999; }
.md :deep(code) { background: #f6f8fa; padding: 2px 6px; border-radius: 4px; }
.md :deep(pre) { background: #0b1021; color: #e6edf5; padding: 12px; border-radius: 6px; overflow: auto; }

.inner {
	background: #fafbfd;
	border: 1px solid #e9edf5;
	border-radius: 8px;
	padding: 12px 12px 10px;
	margin-top: 8px;
}
.actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 12px;
}
.inner :deep(.el-textarea__inner) {
	border-radius: 8px;
	line-height: 1.7;
}
.full-question { margin-top: 10px; background: #f7fafc; border: 1px solid #e6edf5; border-radius: 8px; padding: 10px 12px; }
.full-question .label { display: inline-block; font-size: 12px; color: #909399; padding-right: 8px; }
.full-question .fq-text { display: inline; font-weight: 600; white-space: pre-wrap; word-break: break-word; }
.q-item { margin-bottom: 10px; }
</style>


