<template>
	<section class="card">
    <div class="header">
            <h2>3. 面试大纲</h2>
            <el-button type="primary" @click="$emit('gen-outline')" :loading="loading" :disabled="loading">生成大纲</el-button>
    </div>
    <el-empty v-if="!outline.length" description="点击“生成大纲”开始" />
    <el-table
            v-else
            :data="outline.map((o, i) => ({ index: i + 1, topic: o }))"
            border
            stripe
            size="small"
            style="width: 100%; margin-top: 12px; border-radius: 8px; overflow: hidden;"
    >
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column label="大纲条目">
                    <template #default="scope">
                            <span class="topic-text">{{ scope.row.topic }}</span>
                    </template>
            </el-table-column>
            <el-table-column label="操作" width="160" align="center">
                    <template #default="scope">
                            <el-button size="small" type="primary" plain round @click="$emit('select-outline', scope.row.topic)">选择该条目</el-button>
                    </template>
            </el-table-column>
    </el-table>
	</section>
</template>

<script setup lang="ts">
defineProps<{ outline: string[]; loading?: boolean }>();
defineEmits<{
	(e: 'select-outline', item: string): void;
	(e: 'gen-outline'): void;
}>();
</script>

<style scoped>
.card {
	border: 1px solid #eee;
	border-radius: 8px;
	padding: 16px;
	background: #fff;
}
.header { display: flex; align-items: center; justify-content: space-between; }
.list { list-style: none; padding: 0; margin: 12px 0 0; }
.li { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
.btn {
	padding: 8px 14px;
	background: #2f66f6;
	color: #fff;
	border: none;
	border-radius: 6px;
	cursor: pointer;
}
.btn.small { padding: 6px 10px; font-size: 12px; }
.placeholder { color: #999; margin-top: 8px; }
.topic-text { white-space: pre-wrap; word-break: break-word; }
</style>


