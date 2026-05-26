use minijinja::{context, Environment};

pub struct Renderer {
    template: String,
}

impl Renderer {
    pub fn new(template: &str) -> Self {
        Self {
            template: template.to_string(),
        }
    }

    pub fn render(&self, content: &str) -> Result<String, minijinja::Error> {
        let mut env = Environment::new();
        env.add_template("template", &self.template)?;
        let tmpl = env.get_template("template")?;
        Ok(tmpl.render(context!(content => content))?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_render() {
        let renderer = Renderer::new("<html>{{ content }}</html>");
        assert_eq!(renderer.render("Hello").unwrap(), "<html>Hello</html>");
    }
}
