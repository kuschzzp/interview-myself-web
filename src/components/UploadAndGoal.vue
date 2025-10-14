<template>
	<section class="card">
		<h2>1. 上传简历 PDF + 填写目标岗位</h2>
    <div class="row">
            <el-upload
                    class="uploader"
                    :auto-upload="false"
                    :show-file-list="true"
                    v-model:file-list="fileList"
                    accept="application/pdf"
                    :on-change="onElFile"
            >
                    <el-button type="primary" plain>选择 PDF 简历</el-button>
            </el-upload>
    </div>
    <div class="row">
            <el-input
                    v-model="jobGoal"
                    type="textarea"
                    :rows="8"
                    placeholder="请输入岗位需求、JD 关键词或职责要求，越详细越好"
            />
    </div>
    <div class="row">
            <el-button type="primary" @click="emitRequest" :disabled="!canGen || loading" :loading="loading">生成自我介绍</el-button>
    </div>
	</section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { UploadFile, UploadUserFile } from 'element-plus';

const props = defineProps<{ loading?: boolean; jobGoal?: string; fileList?: any[] }>();
const emit = defineEmits<{
    (e: 'request-generate', payload: { resume?: File; jobGoal: string }): void;
    (e: 'update:jobGoal', value: string): void;
    (e: 'update:file-list', value: any[]): void;
    (e: 'file-selected', file: File): void;
}>();

const resume = ref<File>();
const jobGoal = ref(props.jobGoal || '');
const fileList = ref<any[]>(props.fileList || []);

const canGen = computed(() => !!jobGoal.value && !!resume.value);

// 双向绑定 jobGoal
watch(jobGoal, (v) => emit('update:jobGoal', v));
watch(fileList, (v) => emit('update:file-list', v), { deep: true });

function onFile(e: Event) {
	const input = e.target as HTMLInputElement;
	if (input && input.files && input.files.length > 0) {
		const f = input.files[0];
		if (f.type === 'application/pdf') {
			resume.value = f;
		}
	}
}

function onElFile(file: UploadFile) {
    // el-upload on-change 回调
    if (file && file.raw && file.raw.type === 'application/pdf') {
            resume.value = file.raw;
            emit('file-selected', file.raw);
    }
}

function emitRequest() {
    const g = jobGoal.value.trim();
    emit('request-generate', { resume: resume.value, jobGoal: g });
}
</script>

<style scoped>
.card {
	border: 1px solid #eee;
	border-radius: 8px;
	padding: 16px;
	background: #fff;
}
.row { margin-top: 12px; }
.input {
	width: 100%;
	padding: 8px 10px;
	border: 1px solid #ddd;
	border-radius: 6px;
}
.btn {
	padding: 8px 14px;
	background: #2f66f6;
	color: #fff;
	border: none;
	border-radius: 6px;
	cursor: pointer;
}
.btn:disabled { opacity: .6; cursor: not-allowed; }
</style>


