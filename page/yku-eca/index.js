import { ScoreModel } from "./scoremodel.js";
import { scoreMappings } from "./scoreMappings.js";
import { CountUp } from '../../lib/countup.js';

const model = new ScoreModel(scoreMappings);
const nameInput = document.getElementById('manual-add-name');
const scoreInput = document.getElementById('manual-add-score');
const addButton = document.getElementById('manual-add-addbtn');
const scoresContainer = document.getElementById('scores-container');
const noScoresMessage = document.getElementById('no-scores');
const errorHint = document.getElementById('error-hint');
const totalScoreDisplay = document.getElementById('score-total');
const totalScoreAnimation = new CountUp(totalScoreDisplay, 0, {
    duration: 1.5,
    decimal: '.',
    decimalPlaces: 2,
    useEasing: true,
    useGrouping: false
});
const NO_SELECTED = "请选择……";
const termNameInput = document.getElementById('term-name-input');


//region 成绩显示更新和手动添加钩子

function updateScoresDisplay() {
    scoresContainer.innerHTML = '';
    const scores = model.getAllScores();

    // 当没有成绩时显示提示
    if (scores.length === 0) {
        noScoresMessage.style.display = 'table-row';
        totalScoreAnimation.update(0);
        return;
    }
    noScoresMessage.style.display = 'none';

    // 显示每个成绩
    scores.forEach((score, index) => {
        const scoreElement = document.createElement('tr');
        scoreElement.className = 'score-item';
        scoreElement.innerHTML = `
      <td>${score.name}</td>
      <td>${score.score.toFixed(2)}</td>
      <td class="btn btn-2nd" data-index="${index}">删除</td>
    `;
        scoresContainer.appendChild(scoreElement);
    });

    totalScoreAnimation.update(model.calculateTotalScore());

    document.querySelectorAll('.btn-2nd').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            model.removeScoreItem(index);
            updateScoresDisplay();
        });
    });
}

addButton.addEventListener('click', () => {
    console.debug(nameInput.value)
    console.debug(scoreInput.value)

    if (!nameInput.value && !scoreInput.value) {
        errorHint.textContent = '';
        return;
    }

    try {
        const name = nameInput.value.trim();
        const score = parseFloat(scoreInput.value);

        if (!name) {
            throw new Error('请输入项目名称');
        }

        if (!/^[0-9\-.]+$/.test(score)) {
            throw new Error('请输入有效的成绩数字');
        }

        if (isNaN(score)) {
            throw new Error('请输入有效的成绩数字');
        }

        model.addScoreItem(name, score, false);
        nameInput.value = '';
        scoreInput.value = '';
        errorHint.textContent = '';
        updateScoresDisplay();
    } catch (error) {
        errorHint.textContent = error.message;
    }
});
//endregion

//region 交互窗口

const iaWindow = document.getElementById('interactive-window');


const termBlock = document.getElementById('term-block');
if (!termBlock) {
    throw new Error('未找到term-block');
}
// 令term-title控制term-description的显示和隐藏
termBlock.querySelector('.term-title').addEventListener('click', function() {
    // 这里获取两个是都要标记动画，标题是三角旋转，内容是高度变化
    const desc = document.querySelector('.term-description');
    const title = document.querySelector('.term-title');
    // 计算内容实际高度并设置
    if (desc.classList.contains('expanded')) {
        desc.style.height = '0';
        desc.classList.remove('expanded');
    } else {
        desc.style.height = desc.scrollHeight + 'px';
        desc.classList.add('expanded');
    }
    title.classList.toggle('expanded');
});


function setTermBlock(termName) {
    // 获取项目信息
    const termContent = scoreMappings[termName];
    if (!termContent) {
        throw new Error(`未找到 ${termName} 的映射`);
    }

    // 获取元素
    const termTitleDiv = document.getElementById('term-title');
    termTitleDiv.textContent = termName;
    const termSourceDiv = document.getElementById('term-source-text');
    termSourceDiv.textContent = termContent.source;
    const termDescriptionDiv = document.getElementById('term-description-text');
    termDescriptionDiv.innerHTML = termContent.description.replace(/\n/g, '<br>');
    const termNameInputDiv = document.getElementById('term-name-input');
    termNameInputDiv.placeholder = termContent.suggest ?? '项目名称';

    // 如果是展开状态，设置高度
    if (termDescriptionDiv.classList.contains('expanded')) {
        termDescriptionDiv.style.height = termDescriptionDiv.scrollHeight + 'px';
    }

    // 初始化term-content
    updateTermBlock(termName);
}

function updateTermBlock(termName, selectedQuery = []) {
    const termKeys = document.querySelector('.term-keys');
    const termContent = scoreMappings[termName];
    if (!termContent) { throw new Error(`未找到 ${termName} 的映射`); }

    // 先构建所有列表项和选项
    const items = [];
    let currentLevel = termContent.mapping;
    for (const key of selectedQuery) {
        const item = {
            key: key,
            selects: Object.keys(currentLevel)
        }
        items.push(item);
        currentLevel = currentLevel[key];
    }

    // 提交方法构造
    function submitScore(name, score, isAutoCalculated, keys = []) {
        return () => {
            if (!name || typeof name!=='string') {
                throw new Error('请输入有效的项目名称');
            }
            if (typeof score!== 'number') {
                throw new Error('请输入有效的分数');
            }
            model.addScoreItem(name, score, isAutoCalculated, keys);
            updateScoresDisplay();
            setTermBlock(termNames[currentTermNameIndex])
        }
    }

    // 构建新的HTML内容
    const fragment = document.createDocumentFragment();

    // 构建已选择的部分
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'term-mapping-item';
        itemDiv.innerHTML = `
            <div class="term-mapping-item-content">
              <select class="form-select" style="width: 8em;">
                <option value="" selected disabled style="display: none;">${NO_SELECTED}</option>
                ${item.selects.map(key => 
                    `<option value="${key}" ${key === item.key ? 'selected' : ''}>${key}</option>`
                ).join('')}
              </select>
            </div>
        `;

        // 添加选项回退事件监听器
        itemDiv.querySelector('select').addEventListener('change', (e) => {
            // 截取到当前索引的选择路径
            const newSelectedQuery = selectedQuery.slice(0, index).concat(e.target.value);
            updateTermBlock(termName, newSelectedQuery);
        });

        fragment.appendChild(itemDiv);
    });

    // 构建当前可选的下一级
    if (typeof currentLevel === 'number') {
        const finalDiv = document.createElement('div');
        finalDiv.className = 'term-mapping-item';
        finalDiv.innerHTML = `
            <div class="final-push-button term-mapping-item-content">
              <button class="btn btn-kanban">提交(${currentLevel}分)</button>
            </div>
        `;
        finalDiv.querySelector('button').addEventListener('click', () => {
            const nameInput = document.getElementById('term-name-input');
            submitScore(nameInput.value, currentLevel, true, selectedQuery)();
        });
        fragment.appendChild(finalDiv);
    } // 分数计算完成，直接提交
    else if (Object.keys(currentLevel).length === 0) {
        const finalDiv = document.createElement('div');
        finalDiv.className = 'term-mapping-item';
        finalDiv.innerHTML = `
            <div class="final-push-button term-mapping-item-content">
              <input type="number" class="form-input" placeholder="输入分数" step="0.01">
              <button class="btn btn-1st">提交</button>
            </div>
        `;
        finalDiv.querySelector('button').addEventListener('click', () => {
            const nameInput = document.getElementById('term-name-input');
            const scoreInput = finalDiv.querySelector('input[type="number"]');
            submitScore(nameInput.value, parseFloat(scoreInput.value), false, selectedQuery)();
        });
        fragment.appendChild(finalDiv);
    } // 该选项需要自己填分数
    else if (typeof currentLevel === 'object') {
        const nextDiv = document.createElement('div');
        nextDiv.className = 'term-mapping-item';
        nextDiv.innerHTML = `
            <div class="term-mapping-item-content">
              <select class="form-select" style="width: 8em;">
                <option value="" selected disabled style="display: none;">${NO_SELECTED}</option>
                ${Object.keys(currentLevel).map(key => `<option value="${key}">${key}</option>`).join('')}
              </select>
            </div>
        `;
        nextDiv.querySelector('select').addEventListener('change', (e) => {
            updateTermBlock(termName, selectedQuery.concat(e.target.value));
        });
        fragment.appendChild(nextDiv);
    } // 下一级选项

    // 好的，清吧
    termKeys.innerHTML = '';
    termKeys.appendChild(fragment);
}
// 窗口切换
const termNames = Object.keys(scoreMappings);
if (termNames.length === 0) { throw new Error('未找到任何学期'); }
let currentTermNameIndex = 0;
setTermBlock(termNames[currentTermNameIndex]);
function updateTerm(delta) {
    currentTermNameIndex = (currentTermNameIndex + delta + termNames.length) % termNames.length
    setTermBlock(termNames[currentTermNameIndex])
}
document.getElementById('term-prev').onclick = () => updateTerm(-1)
document.getElementById('term-next').onclick = () => updateTerm(1)


//endregion


updateScoresDisplay();
