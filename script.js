async function startScan() {

    const input = document.getElementById("target");
    const output = document.getElementById("output");
    const status = document.getElementById("status");
    const progressBox = document.getElementById("progressBox");
    const progress = document.getElementById("progress");

    let url;

    try {
        url = new URL(input.value.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error();
        }

    } catch {
        alert("الرجاء إدخال رابط صحيح");
        return;
    }

    document.getElementById("results").style.display = "block";
    document.getElementById("details").style.display = "none";

    output.innerHTML = "";
    progressBox.style.display = "block";

    const checks = [
        {
            name: "HTTPS / SSL",
            run: () => ({
                issue: url.protocol !== "https:",
                title: "الاتصال غير مشفر باستخدام HTTPS",
                severity: "high",
                fix: "فعّل شهادة SSL واستخدم HTTPS."
            })
        },
        {
            name: "URL Security",
            run: () => ({
                issue: !!url.username || !!url.password,
                title: "الرابط يحتوي على بيانات دخول",
                severity: "high",
                fix: "لا تضع أسماء المستخدمين أو كلمات المرور داخل الرابط."
            })
        },
        {
            name: "Security Headers",
            run: () => ({
                issue: false,
                title: "تعذر التحقق من ترويسات الحماية",
                severity: "low",
                fix: "يحتاج هذا الفحص إلى خدمة خلفية تستطيع قراءة HTTP Headers."
            })
        },
        {
            name: "XSS",
            run: () => ({
                issue: false,
                title: "لم يتم اختبار XSS",
                severity: "low",
                fix: "يتطلب اختبار XSS فحصاً مصرحاً به لمدخلات الموقع."
            })
        },
        {
            name: "SQL Injection",
            run: () => ({
                issue: false,
                title: "لم يتم اختبار SQL Injection",
                severity: "low",
                fix: "يتطلب تحليل التطبيق واختبارات آمنة مصرحاً بها."
            })
        }
    ];

    let findings = [];

    for (let i = 0; i < checks.length; i++) {

        status.innerText = "جاري تحليل: " + checks[i].name;

        await new Promise(resolve => setTimeout(resolve, 450));

        const result = checks[i].run();

        if (result.issue) {
            findings.push({
                ...result,
                category: checks[i].name
            });
        }

        progress.style.width = ((i + 1) / checks.length * 100) + "%";
    }

    status.innerText = "اكتمل التحليل";

    if (findings.length === 0) {
        output.innerHTML = `
            <div class="card">
                <h3>لم يتم اكتشاف مشكلة مؤكدة في الفحوصات المحدودة.</h3>
                <p>هذا لا يعني أن الموقع خالٍ من الثغرات.</p>
            </div>
        `;
    }

    findings.forEach((item, index) => {

        const id = item.category.toLowerCase().replaceAll(" ", "-");

        output.innerHTML += `
            <div class="card">
                <h3>🔴 ${item.category}</h3>
                <p>${item.title}</p>
                <a href="${url.href}" target="_blank" rel="noopener noreferrer">
                    ${url.href}
                </a>
                <button onclick="showDetails(${index})">
                    عرض التفاصيل والإصلاح
                </button>
            </div>
        `;
    });

    window.scanFindings = findings;
    window.scanTarget = url.href;
}

function showDetails(index) {

    const item = window.scanFindings[index];

    document.getElementById("results").style.display = "none";

    const details = document.getElementById("details");
    details.style.display = "block";

    document.getElementById("detailContent").innerHTML = `
        <div class="card">
            <h3>${item.category}</h3>

            <p>المشكلة: ${item.title}</p>

            <p>الرابط المتأثر:</p>

            <a href="${window.scanTarget}"
            target="_blank" rel="noopener noreferrer">
                ${window.scanTarget}
            </a>

            <h3>طريقة الإصلاح</h3>
            <p>${item.fix}</p>

            <h3>حالة الفحص</h3>
            <p>هذه نتيجة فحص أولي وليست إثباتاً لوجود ثغرة قابلة للاستغلال.</p>

            <a href="#vulnerability=${encodeURIComponent(item.category)}">
                رابط تفاصيل المشكلة
            </a>
        </div>
    `;
}

function closeDetails() {
    document.getElementById("details").style.display = "none";
    document.getElementById("results").style.display = "block";
}
