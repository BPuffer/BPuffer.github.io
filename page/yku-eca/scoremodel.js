
// 成绩数据模型
class ScoreModel {
    constructor(scoreMappings) {
        this.scores = [];
        this.scoreMappings = scoreMappings;
    }

    // 添加成绩项
    addScoreItem(name, score, isAutoCalculated, keys = []) {
        if (!name || typeof name !== 'string') {
            throw new Error('项目名称必须为字符串');
        }
        if (typeof score !== 'number') {
            throw new Error('成绩必须为数字');
        }
        if (typeof isAutoCalculated!== 'boolean') {
            throw new Error('是否已自动计算必须为布尔值');
        }

        const scoreItem = {
            name: name,
            score: score,
            isAutoCalculated: isAutoCalculated,
            keys: keys
        };

        this.scores.push(scoreItem);
        return scoreItem;
    }

    // 获取所有成绩
    getAllScores() {
        return this.scores;
    }

    // 计算总分
    calculateTotalScore() {
        return this.scores.reduce((total, item) => total + item.score, 0);
    }

    // 删除成绩项
    removeScoreItem(index) {
        if (index >= 0 && index < this.scores.length) {
            this.scores.splice(index, 1);
            return true;
        }
        return false;
    }

    // 添加自定义字段和分数的成绩项
    addCustomScore(name, score, customFields = {}) {
        return this.addScoreItem({
            name: name,
            score: score,
            isAutoCalculated: false
        }, customFields);
    }

    // 支持任意层级的映射
    addMappedScore(mappingName, keys, name) {
        if (!this.scoreMappings[mappingName]) {
            throw new Error(`未找到映射规则: ${mappingName}`);
        }
        if (!Array.isArray(keys)) {
            throw new Error('映射键必须是一个数组');
        }
        let currentLevel = this.scoreMappings[mappingName].mapping;

        for (const key of keys) {
            if (currentLevel[key] === undefined) {
                throw new Error(`映射规则${mappingName}中未找到键: ${key} (of ${keys})`);
            }
            currentLevel = currentLevel[key];
        }

        if (typeof currentLevel !== 'number') {
            throw new Error('最终映射必须是一个数字');
        }

        return this.addScoreItem(name, currentLevel, true, keys);
    }
}


export { ScoreModel };