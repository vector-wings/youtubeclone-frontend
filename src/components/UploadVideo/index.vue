<!-- src\components\UploadVideo\index.vue -->
<template>
    <div class="sc-AxiKw dZbDOR">
        <div class="modal-content">
            <form @submit.prevent="handleSumit">
                <div class="modal-header">
                    <div class="modal-header-left">
                        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" @click="handleClose">
                            <g>
                                <path
                                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
                                </path>
                            </g>
                        </svg>
                        <h3>Upload Video</h3>
                    </div>
                    <div style="display: block">
                        <button class="sc-AxirZ erzyjX">Save</button>
                    </div>
                </div>
                <div class="tab video-form">
                    <input ref="file" required type="file" @change="handleFileChange" />
                    <video ref="videoEl" controls></video>
                    <input v-model="video.title" required type="text" placeholder="Enter the title" />
                    <textarea v-model="video.description" required placeholder="Tell viewers about your video"></textarea>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { createUploadVideo, refreshUploadVideo } from '@/api/vod'
import { createVideo } from '@/api/video'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
    name: 'UploadVideo',
    setup(props, context) {
        const router = useRouter()
        const file = ref(null)
        const videoEl = ref(null)
        const video = reactive({
            title: '',
            description: '',
            vodVideoId: '',
        })
        const handleClose = () => {
            // 对外发布一个自定义事件
            context.emit('close')
        }
        const handleFileChange = () => {
            const fileObj = (file.value as any).files[0]
                ; (videoEl.value as any).src = URL.createObjectURL(fileObj)
        }
        const createUploader = () => {
            const uploader = new window.AliyunUpload.Vod({
                // userID，必填，您可以使用阿里云账号访问账号中心（https://account.console.aliyun.com/），即可查看账号ID
                userId: "1148476770324795",
                // 上传到视频点播的地域，默认值为'cn-shanghai'，
                //eu-central-1，ap-southeast-1
                region: "",
                // 分片大小默认1 MB，不能小于100 KB（100*1024）
                partSize: 1048576,
                // 并行上传分片个数，默认5
                parallel: 5,
                // 网络原因失败时，重新上传次数，默认为3
                retryCount: 3,
                // 网络原因失败时，重新上传间隔时间，默认为2秒
                retryDuration: 2,
                // 开始上传
                onUploadstarted: async function (uploadInfo: any) {
                    if (uploadInfo.videoId) {
                        const { data } = await refreshUploadVideo(uploadInfo.videoId)
                        uploader.setUploadAuthAndAddress(uploadInfo, data.UploadAuth, data.UploadAddress, data.VideoId)
                    } else {
                        const { data } = await createUploadVideo({
                            Title: uploadInfo.file.name,
                            FileName: uploadInfo.file.name,
                        })
                        uploader.setUploadAuthAndAddress(uploadInfo, data.UploadAuth, data.UploadAddress, data.VideoId)
                    }
                },
                // 文件上传成功
                onUploadSucceed: async function (uploadInfo: any) {
                    console.log('uploadInfo:', uploadInfo)

                    video.vodVideoId = uploadInfo.videoId
                    // 提交后台保存数据
                    const { data } = await createVideo(video)
                    console.log('保存成功', data)
                    router.push({
                        name: 'watch',
                        params: {
                            videoId: data.video._id
                        }
                    })
                    context.emit('close')
                },
                // 文件上传失败
                onUploadFailed: function (uploadInfo: any, code: any, message: any) {
                },
                // 文件上传进度，单位：字节
                onUploadProgress: function (uploadInfo: any, totalSize: any, loadedPercent: any) {
                },
                // 上传凭证或STS token超时
                onUploadTokenExpired: async function (uploadInfo: any) {
                    const { data } = await refreshUploadVideo(uploadInfo.videoId)
                    uploader.resumeUploadWithAuth(data.UploadAuth)
                },
                // 全部文件上传结束
                onUploadEnd: function (uploadInfo: any) {
                }
            })
            return uploader
        }
        const handleSumit = async () => {
            // 获取 uploader 上传实例
            const uploader = createUploader()
            // 添加上传文件
            const paramData = JSON.stringify({
                Vod: {}
            })
            uploader.addFile((file.value as any).files[0], null, null, null, paramData)
            // 开始上传
            uploader.startUpload()
            // 上传完成 -> 创建视频
        }
        return {
            handleClose,
            file,
            videoEl,
            handleFileChange,
            handleSumit,
            video,
        }
    }
})
</script>